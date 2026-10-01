import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Module } from '@nestjs/common';
import { NotificationSettings } from '../database/entities/notification-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, NotificationSettings]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
