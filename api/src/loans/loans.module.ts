import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Loan } from '../database/entities/loan.entity';
import { LoanPayment } from '../database/entities/loan-payment.entity';
import { Account } from '../database/entities/account.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { LoansService } from './loans.service';
import { LoanPaymentsService } from './loan-payments.service';
import { LoansController } from './loans.controller';
import { LoanPaymentsController } from './loan-payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanPayment, Account, Transaction]),
  ],
  controllers: [LoansController, LoanPaymentsController],
  providers: [LoansService, LoanPaymentsService],
  exports: [LoansService, LoanPaymentsService],
})
export class LoansModule {}
