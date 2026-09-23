import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Account } from '../database/entities/account.entity';
import { Category } from '../database/entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionType } from '../database/enums/transaction-type.enum';
import { CategoryType } from '../database/enums/category-type.enum';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly dataSource: DataSource,
  ) {}

  async findAllForUser(userId: string, query: QueryTransactionsDto) {
    const {
      accountId,
      categoryId,
      type,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.transferToAccount', 'transferToAccount')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (accountId) {
      queryBuilder.andWhere('transaction.accountId = :accountId', {
        accountId,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', {
        type,
      });
    }

    if (dateFrom) {
      queryBuilder.andWhere('transaction.date >= :dateFrom', {
        dateFrom,
      });
    }

    if (dateTo) {
      queryBuilder.andWhere('transaction.date <= :dateTo', {
        dateTo,
      });
    }

    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForUser(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        user: {
          id: userId,
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { account, category, transferToAccount } =
        await this.validateTransaction(
          queryRunner,
          createTransactionDto,
          userId,
        );

      this.applyTransactionEffect(
        account,
        transferToAccount,
        createTransactionDto.type,
        createTransactionDto.amount,
      );

      await queryRunner.manager.save(Account, account);

      if (transferToAccount) {
        await queryRunner.manager.save(Account, transferToAccount);
      }

      const transaction = queryRunner.manager.create(Transaction, {
        user: {
          id: userId,
        },
        account,
        transferToAccount,
        category,
        type: createTransactionDto.type,
        amount: createTransactionDto.amount,
        currency: createTransactionDto.currency,
        date: new Date(createTransactionDto.date),
        description: createTransactionDto.description,
      });

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: {
          id: transactionId,
          user: {
            id: userId,
          },
        },
        relations: {
          account: true,
          transferToAccount: true,
          category: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      const oldAccount = transaction.account;

      const oldTransferToAccount = transaction.transferToAccount ?? null;

      const accountsToLock = [oldAccount];

      if (oldTransferToAccount) {
        accountsToLock.push(oldTransferToAccount);
      }

      for (const account of accountsToLock) {
        await queryRunner.manager.findOne(Account, {
          where: {
            id: account.id,
            user: {
              id: userId,
            },
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });
      }

      this.reverseTransactionEffect(
        oldAccount,
        oldTransferToAccount,
        transaction.type,
        transaction.amount,
      );

      await queryRunner.manager.save(Account, oldAccount);

      if (oldTransferToAccount) {
        await queryRunner.manager.save(Account, oldTransferToAccount);
      }

      const transferToAccountId =
        updateTransactionDto.type &&
        updateTransactionDto.type !== TransactionType.TRANSFER
          ? undefined
          : (updateTransactionDto.transferToAccountId ??
            transaction.transferToAccount?.id);

      const categoryId =
        updateTransactionDto.type === TransactionType.TRANSFER
          ? undefined
          : (updateTransactionDto.categoryId ?? transaction.category?.id);

      const mergedDto: CreateTransactionDto = {
        accountId: updateTransactionDto.accountId ?? transaction.account.id,

        transferToAccountId,

        categoryId,

        type: updateTransactionDto.type ?? transaction.type,

        amount: updateTransactionDto.amount ?? transaction.amount,

        currency: updateTransactionDto.currency ?? transaction.currency,

        date: updateTransactionDto.date ?? transaction.date.toISOString(),

        description:
          updateTransactionDto.description ??
          transaction.description ??
          undefined,
      };

      const { account, category, transferToAccount } =
        await this.validateTransaction(queryRunner, mergedDto, userId);

      this.applyTransactionEffect(
        account,
        transferToAccount,
        mergedDto.type,
        mergedDto.amount,
      );

      await queryRunner.manager.save(Account, account);

      if (transferToAccount) {
        await queryRunner.manager.save(Account, transferToAccount);
      }

      transaction.account = account;
      transaction.transferToAccount = transferToAccount ?? null;
      transaction.category = category ?? null;
      transaction.type = mergedDto.type;
      transaction.amount = mergedDto.amount;
      transaction.currency = mergedDto.currency;
      transaction.date = new Date(mergedDto.date);
      transaction.description = mergedDto.description ?? null;

      const updatedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(transactionId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: {
          id: transactionId,
          user: {
            id: userId,
          },
        },
        relations: {
          account: true,
          transferToAccount: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      const account = transaction.account;
      const transferToAccount = transaction.transferToAccount ?? null;

      const accountsToLock = [account];

      if (transferToAccount) {
        accountsToLock.push(transferToAccount);
      }

      for (const accountToLock of accountsToLock) {
        await queryRunner.manager.findOne(Account, {
          where: {
            id: accountToLock.id,
            user: {
              id: userId,
            },
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });
      }

      this.reverseTransactionEffect(
        account,
        transferToAccount,
        transaction.type,
        transaction.amount,
      );

      await queryRunner.manager.save(Account, account);

      if (transferToAccount) {
        await queryRunner.manager.save(Account, transferToAccount);
      }

      await queryRunner.manager.remove(Transaction, transaction);

      await queryRunner.commitTransaction();

      return {
        message: 'Transaction deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateTransaction(
    queryRunner: QueryRunner,
    dto: CreateTransactionDto,
    userId: string,
  ) {
    const { accountId, transferToAccountId, categoryId, type, currency } = dto;

    const account = await queryRunner.manager.findOne(Account, {
      where: {
        id: accountId,
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

    const numericAmount = new Decimal(dto.amount);

    if (!numericAmount.isFinite()) {
      throw new BadRequestException('Amount must be a valid number');
    }
    if (numericAmount.lte(0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    if (account.currency !== currency) {
      throw new BadRequestException(
        'Transaction currency must match account currency',
      );
    }

    let category: Category | null = null;

    if (categoryId) {
      category = await queryRunner.manager.findOne(Category, {
        where: {
          id: categoryId,
          user: {
            id: userId,
          },
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    let transferToAccount: Account | null = null;

    if (transferToAccountId) {
      transferToAccount = await queryRunner.manager.findOne(Account, {
        where: {
          id: transferToAccountId,
          user: {
            id: userId,
          },
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!transferToAccount) {
        throw new NotFoundException('Destination account not found');
      }

      if (transferToAccount.currency !== currency) {
        throw new BadRequestException(
          'Source and destination accounts must have the same currency',
        );
      }
    }

    if (type === TransactionType.TRANSFER) {
      if (!transferToAccountId) {
        throw new BadRequestException('Transfer destination is required');
      }

      if (accountId === transferToAccountId) {
        throw new BadRequestException(
          'Source and destination accounts must be different',
        );
      }

      if (categoryId) {
        throw new BadRequestException('Transfer cannot have a category');
      }
    }

    if (type !== TransactionType.TRANSFER && transferToAccountId) {
      throw new BadRequestException(
        'Only transfers can have a destination account',
      );
    }

    if (type !== TransactionType.TRANSFER && !categoryId) {
      throw new BadRequestException(
        'Category is required for income and expense',
      );
    }

    if (
      type === TransactionType.INCOME &&
      category?.type !== CategoryType.INCOME
    ) {
      throw new BadRequestException(
        'Income transactions require an income category',
      );
    }

    if (
      type === TransactionType.EXPENSE &&
      category?.type !== CategoryType.EXPENSE
    ) {
      throw new BadRequestException(
        'Expense transactions require an expense category',
      );
    }

    return {
      account,
      category,
      transferToAccount,
    };
  }

  private applyTransactionEffect(
    account: Account,
    transferToAccount: Account | null,
    type: TransactionType,
    amount: string,
  ) {
    const numericAmount = new Decimal(amount);

    if (type === TransactionType.INCOME) {
      account.currentBalance = new Decimal(account.currentBalance)
        .plus(numericAmount)
        .toFixed(2);
    }

    if (type === TransactionType.EXPENSE) {
      account.currentBalance = new Decimal(account.currentBalance)
        .minus(numericAmount)
        .toFixed(2);
    }

    if (type === TransactionType.TRANSFER) {
      account.currentBalance = new Decimal(account.currentBalance)
        .minus(numericAmount)
        .toFixed(2);
      if (!transferToAccount) {
        throw new BadRequestException('Transfer destination is required');
      }
      transferToAccount.currentBalance = new Decimal(
        transferToAccount.currentBalance,
      )
        .plus(numericAmount)
        .toFixed(2);
    }
  }

  private reverseTransactionEffect(
    account: Account,
    transferToAccount: Account | null,
    type: TransactionType,
    amount: string,
  ) {
    const numericAmount = new Decimal(amount);

    if (type === TransactionType.INCOME) {
      account.currentBalance = new Decimal(account.currentBalance)
        .minus(numericAmount)
        .toFixed(2);
    }

    if (type === TransactionType.EXPENSE) {
      account.currentBalance = new Decimal(account.currentBalance)
        .plus(numericAmount)
        .toFixed(2);
    }

    if (type === TransactionType.TRANSFER) {
      account.currentBalance = new Decimal(account.currentBalance)
        .plus(numericAmount)
        .toFixed(2);
      if (!transferToAccount) {
        throw new BadRequestException('Transfer destination is required');
      }
      transferToAccount.currentBalance = new Decimal(
        transferToAccount.currentBalance,
      )
        .minus(numericAmount)
        .toFixed(2);
    }
  }
}
