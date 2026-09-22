import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../database/entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async findAllForUser(userId: string) {
    return this.accountRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForUser(accountId: string, userId: string) {
    const account = await this.accountRepository.findOne({
      where: {
        id: accountId,
        user: {
          id: userId,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async create(createAccountDto: CreateAccountDto, userId: string) {
    const account = this.accountRepository.create({
      ...createAccountDto,
      currentBalance: createAccountDto.initialBalance,
      user: {
        id: userId,
      },
    });

    return this.accountRepository.save(account);
  }

  async update(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ) {
    const account = await this.findOneForUser(accountId, userId);

    Object.assign(account, updateAccountDto);

    return this.accountRepository.save(account);
  }

  async remove(accountId: string, userId: string) {
    const account = await this.findOneForUser(accountId, userId);
    await this.accountRepository.remove(account);

    return {
      message: 'Account deleted successfully',
    };
  }
}
