import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { NotificationSettings } from '../database/entities/notification-settings.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { MailService } from '../mail/mail.service';
import { VerificationToken } from '../database/entities/verification-token.entity';
import { VerificationTokenType } from '../database/enums/verification-token-type.enum';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepository: Repository<NotificationSettings>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(VerificationToken)
    private readonly verificationTokenRepository: Repository<VerificationToken>,

    private readonly mailService: MailService,

    private readonly dataSource: DataSource,

    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private signAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, email: user.email });
  }

  private async issueRefreshToken(
    user: User,
    userAgent?: string,
  ): Promise<string> {
    const rawToken = crypto.randomBytes(64).toString('hex');

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(rawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: userAgent ?? null,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return rawToken;
  }

  private async issueVerificationToken(
    userId: string,
    type: VerificationTokenType,
    ttlMs: number,
  ): Promise<string> {
    await this.verificationTokenRepository.delete({ userId, type });

    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenEntity = this.verificationTokenRepository.create({
      userId,
      tokenHash: this.hashToken(rawToken),
      type,
      expiresAt: new Date(Date.now() + ttlMs),
    });

    await this.verificationTokenRepository.save(tokenEntity);

    return rawToken;
  }

  async register(registerDto: RegisterDto, userAgent?: string) {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(password);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let user: User;

    try {
      user = queryRunner.manager.create(User, {
        email,
        passwordHash,
      });

      await queryRunner.manager.save(user);

      const notificationSettings = queryRunner.manager.create(
        NotificationSettings,
        {
          user,
        },
      );

      await queryRunner.manager.save(notificationSettings);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user, userAgent);

    const verificationToken = await this.issueVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION,
      24 * 60 * 60 * 1000,
    );
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto, userAgent?: string) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user, userAgent);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  async refresh(rawToken: string, userAgent?: string) {
    const tokenHash = this.hashToken(rawToken);

    const existing = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
      },
      relations: { user: true },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = existing.user;
    const newRawToken = crypto.randomBytes(64).toString('hex');

    const newRefreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: this.hashToken(newRawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: userAgent ?? null,
    });

    await this.refreshTokenRepository.save(newRefreshToken);

    existing.revokedAt = new Date();
    existing.replacedById = newRefreshToken.id;
    await this.refreshTokenRepository.save(existing);

    const accessToken = await this.signAccessToken(user);

    return {
      accessToken,
      refreshToken: newRawToken,
    };
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);

    const existing = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (existing && !existing.revokedAt) {
      existing.revokedAt = new Date();
      await this.refreshTokenRepository.save(existing);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return;

    const token = await this.issueVerificationToken(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
      60 * 60 * 1000,
    );
    await this.mailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const tokenEntity = await this.verificationTokenRepository.findOne({
      where: {
        tokenHash: this.hashToken(rawToken),
        type: VerificationTokenType.PASSWORD_RESET,
      },
      relations: { user: true },
    });

    if (!tokenEntity || tokenEntity.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset link.');
    }

    const user = tokenEntity.user;
    user.passwordHash = await argon2.hash(newPassword);
    await this.userRepository.save(user);

    await this.verificationTokenRepository.delete({
      userId: user.id,
      type: VerificationTokenType.PASSWORD_RESET,
    });

    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId: user.id })
      .andWhere('revokedAt IS NULL')
      .execute();

    return { message: 'Password reset successfully. Please sign in.' };
  }

  async verifyEmail(rawToken: string): Promise<{ message: string }> {
    const tokenEntity = await this.verificationTokenRepository.findOne({
      where: {
        tokenHash: this.hashToken(rawToken),
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
      relations: { user: true },
    });

    console.log(tokenEntity, tokenEntity?.expiresAt, Date.now());

    if (!tokenEntity || tokenEntity.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    tokenEntity.user.emailVerified = true;

    await this.userRepository.save(tokenEntity.user);

    await this.verificationTokenRepository.delete({
      id: tokenEntity.id,
    });

    return {
      message: 'Email verified successfully.',
    };
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.emailVerified) return;

    const token = await this.issueVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION,
      24 * 60 * 60 * 1000,
    );
    await this.mailService.sendVerificationEmail(user.email, token);
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }
}
