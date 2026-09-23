import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from '../database/entities/loan.entity';
import { DataSource, Repository } from 'typeorm';
import { LoanPayment } from '../database/entities/loan-payment.entity';
import { Account } from '../database/entities/account.entity';
import { Transaction } from '../database/entities/transaction.entity';
import Decimal from 'decimal.js';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';
import { LoanType } from '../database/enums/loan-type.enum';
import { TransactionType } from '../database/enums/transaction-type.enum';

@Injectable()
export class LoanPaymentsService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepository: Repository<LoanPayment>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly dataSource: DataSource,
  ) {}

  private async findLoanForUser(loanId: string, userId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: {
        id: loanId,
        user: {
          id: userId,
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async findAllForLoan(loanId: string, userId: string) {
    await this.findLoanForUser(loanId, userId);

    return this.loanPaymentRepository.find({
      where: {
        loan: {
          id: loanId,
        },
      },
      relations: {
        account: true,
        transaction: true,
      },
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async create(createLoanPaymentDto: CreateLoanPaymentDto, userId: string) {
    const amount = new Decimal(createLoanPaymentDto.amount);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const loan = await queryRunner.manager.findOne(Loan, {
        where: {
          id: createLoanPaymentDto.loanId,
          user: {
            id: userId,
          },
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      const account = await queryRunner.manager.findOne(Account, {
        where: {
          id: createLoanPaymentDto.accountId,
          user: {
            id: userId,
          },
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (loan.currency !== createLoanPaymentDto.currency) {
        throw new BadRequestException(
          'Payment currency must match loan currency',
        );
      }

      if (account.currency !== createLoanPaymentDto.currency) {
        throw new BadRequestException(
          'Payment currency must match account currency',
        );
      }

      const currentLoanBalance = new Decimal(loan.currentLoanBalance);

      if (currentLoanBalance.lte(0)) {
        throw new BadRequestException('Loan has already been fully repaid');
      }

      const transactionType =
        loan.type === LoanType.BORROWED
          ? TransactionType.EXPENSE
          : TransactionType.INCOME;

      const accountBalance = new Decimal(account.currentBalance);

      const newAccountBalance =
        loan.type === LoanType.BORROWED
          ? accountBalance.minus(amount)
          : accountBalance.plus(amount);

      const newLoanBalance = Decimal.max(0, currentLoanBalance.minus(amount));

      const transaction = queryRunner.manager.create(Transaction, {
        user: {
          id: userId,
        },
        account,
        transferToAccount: null,
        category: null,
        type: transactionType,
        amount: amount.toFixed(2),
        currency: createLoanPaymentDto.currency,
        date: new Date(createLoanPaymentDto.date),
        description:
          createLoanPaymentDto.note ?? `Loan payment: ${loan.personName}`,
      });

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      const loanPayment = queryRunner.manager.create(LoanPayment, {
        loan,
        account,
        transaction: savedTransaction,
        amount: amount.toFixed(2),
        currency: createLoanPaymentDto.currency,
        date: new Date(createLoanPaymentDto.date),
        note: createLoanPaymentDto.note ?? null,
      });

      const savedLoanPayment = await queryRunner.manager.save(
        LoanPayment,
        loanPayment,
      );

      await queryRunner.manager.save(Account, account);
      await queryRunner.manager.save(Loan, loan);

      await queryRunner.commitTransaction();

      account.currentBalance = newAccountBalance.toFixed(2);
      loan.currentLoanBalance = newLoanBalance.toFixed(2);

      return savedLoanPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
