import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/account')
  getAccountInfo(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getAccount(user.userId);
  }

  @Get('me/notification-settings')
  getNotificationSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getNotificationSettings(user.userId);
  }

  @Patch('me/notification-settings')
  updateNotificationSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(user.userId, dto);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const currentRefreshToken = cookies[REFRESH_COOKIE_NAME];

    return this.usersService.changePassword(
      user.userId,
      dto,
      currentRefreshToken,
    );
  }

  @Delete('me')
  deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.userId, dto.password);
  }
}
