import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanPaymentsService } from './loan-payments.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';

@Controller('loans/payments')
@UseGuards(JwtAuthGuard)
export class LoanPaymentsController {
  constructor(private readonly loanPaymentsService: LoanPaymentsService) {}

  @Get(':loanId')
  findAll(
    @Param('loanId') loanId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.loanPaymentsService.findAllForLoan(loanId, user.userId);
  }

  @Post()
  create(
    @Body() createLoanPaymentDto: CreateLoanPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.loanPaymentsService.create(createLoanPaymentDto, user.userId);
  }
}
