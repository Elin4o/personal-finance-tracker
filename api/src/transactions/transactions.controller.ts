import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Query() query: QueryTransactionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.findAllForUser(user.userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id') transactionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.findOneForUser(transactionId, user.userId);
  }

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.create(createTransactionDto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.update(
      transactionId,
      updateTransactionDto,
      user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') transactionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.remove(transactionId, user.userId);
  }
}
