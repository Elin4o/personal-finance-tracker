import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Category } from './entities/category.entity';
import { Loan } from './entities/loan.entity';
import { LoanPayment } from './entities/loan-payment.entity';
import { NotificationSettings } from './entities/notification-settings.entity';
import { SavingsGoal } from './entities/savings-goal.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      Category,
      Transaction,
      Loan,
      LoanPayment,
      SavingsGoal,
      NotificationSettings,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
