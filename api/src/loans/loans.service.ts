import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from '../database/entities/loan.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateLoanDto } from './dto/create-loan.dto';
import Decimal from 'decimal.js';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Account } from '../database/entities/account.entity';
import { LoanPayment } from '../database/entities/loan-payment.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { LoanType } from '../database/enums/loan-type.enum';
import { TransactionType } from '../database/enums/transaction-type.enum';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepository: Repository<LoanPayment>,

    private readonly dataSource: DataSource,
  ) {}

  async findAllForUser(userId: string) {
    return await this.loanRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        payments: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForUser(loanId: string, userId: string) {
    const loan = await this.loanRepository.findOne({
      where: {
        id: loanId,
        user: {
          id: userId,
        },
      },
      relations: {
        payments: true,
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async create(createLoanDto: CreateLoanDto, userId: string) {
    const amount = new Decimal(createLoanDto.amount);

    if (!amount.isFinite() || amount.lte(0)) {
      throw new BadRequestException('Loan amount must be greater than zero');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(Account, {
        where: {
          id: createLoanDto.accountId,
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

      if (account.currency !== createLoanDto.currency) {
        throw new BadRequestException(
          'Loan currency must match account currency',
        );
      }

      const loan = queryRunner.manager.create(Loan, {
        personName: createLoanDto.personName,
        type: createLoanDto.type,
        amount: amount.toFixed(2),
        currentLoanBalance: amount.toFixed(2),
        currency: createLoanDto.currency,
        date: new Date(createLoanDto.date),
        dueDate: createLoanDto.dueDate ? new Date(createLoanDto.dueDate) : null,
        description: createLoanDto.description ?? null,
        user: {
          id: userId,
        },
      });

      const savedLoan = await queryRunner.manager.save(Loan, loan);

      const transactionType =
        createLoanDto.type === LoanType.BORROWED
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;

      const currentBalance = new Decimal(account.currentBalance);

      const newBalance =
        createLoanDto.type === LoanType.BORROWED
          ? currentBalance.plus(amount)
          : currentBalance.minus(amount);

      const transaction = queryRunner.manager.create(Transaction, {
        user: {
          id: userId,
        },
        account,
        transferToAccount: null,
        category: null,
        type: transactionType,
        amount: amount.toFixed(2),
        currency: createLoanDto.currency,
        date: new Date(createLoanDto.date),
        description: `Loan created: ${createLoanDto.personName}`,
      });

      await queryRunner.manager.save(Transaction, transaction);

      account.currentBalance = newBalance.toFixed(2);

      await queryRunner.manager.save(Account, account);

      await queryRunner.commitTransaction();

      return savedLoan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(loanId: string, updateLoanDto: UpdateLoanDto, userId: string) {
    const loan = await this.findOneForUser(loanId, userId);

    if (
      updateLoanDto.amount !== undefined &&
      updateLoanDto.amount !== loan.amount
    ) {
      if (loan.payments.length > 0) {
        throw new BadRequestException(
          'Loan amount cannot be changed after payments have been made',
        );
      }

      const amount = new Decimal(updateLoanDto.amount);

      if (!amount.isFinite() || amount.lte(0)) {
        throw new BadRequestException('Loan amount must be greater than zero');
      }

      loan.amount = amount.toFixed(2);
      loan.currentLoanBalance = amount.toFixed(2);
    }

    if (updateLoanDto.personName !== undefined) {
      loan.personName = updateLoanDto.personName;
    }

    if (updateLoanDto.currency !== undefined) {
      if (loan.payments.length > 0) {
        throw new BadRequestException(
          'Loan currency cannot be changed after payments have been made',
        );
      }

      loan.currency = updateLoanDto.currency;
    }

    if (updateLoanDto.date !== undefined) {
      loan.date = new Date(updateLoanDto.date);
    }

    if (updateLoanDto.dueDate !== undefined) {
      loan.dueDate = updateLoanDto.dueDate
        ? new Date(updateLoanDto.dueDate)
        : null;
    }

    if (updateLoanDto.description !== undefined) {
      loan.description = updateLoanDto.description;
    }

    if (updateLoanDto.type !== undefined) {
      loan.type = updateLoanDto.type;
    }

    return this.loanRepository.save(loan);
  }

  async remove(loanId: string, userId: string) {
    const loan = await this.findOneForUser(loanId, userId);

    if (loan.payments.length > 0) {
      throw new BadRequestException('Loan with payments cannot be deleted');
    }

    await this.loanRepository.remove(loan);

    return {
      message: 'Loan deleted successfully',
    };
  }
}
