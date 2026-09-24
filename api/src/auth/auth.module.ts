import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { NotificationSettings } from '../database/entities/notification-settings.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotificationSettings, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenCleanupService],
  exports: [],
})
export class AuthModule {}
