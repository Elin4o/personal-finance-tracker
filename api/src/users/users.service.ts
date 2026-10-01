import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as argon2 from 'argon2';
import { createHash } from 'crypto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { NotificationSettings } from '../database/entities/notification-settings.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepository: Repository<NotificationSettings>,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    currentRefreshToken?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    user.passwordHash = await argon2.hash(dto.newPassword);
    await this.userRepository.save(user);

    const query = this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL');

    if (currentRefreshToken) {
      query.andWhere('tokenHash != :currentHash', {
        currentHash: this.hashToken(currentRefreshToken),
      });
    }

    await query.execute();

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Incorrect password');

    await this.userRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.notificationSettingsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!settings)
      throw new NotFoundException('Notification settings not found');

    return settings;
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    const settings = await this.notificationSettingsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!settings)
      throw new NotFoundException('Notification settings not found');

    Object.assign(settings, dto);

    return this.notificationSettingsRepository.save(settings);
  }
}
