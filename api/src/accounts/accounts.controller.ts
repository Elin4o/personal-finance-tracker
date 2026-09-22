import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.accountsService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') accountId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accountsService.findOneForUser(accountId, user.userId);
  }

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accountsService.create(createAccountDto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accountsService.update(
      accountId,
      updateAccountDto,
      user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') accountId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accountsService.remove(accountId, user.userId);
  }
}
