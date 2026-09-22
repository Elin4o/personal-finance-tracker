import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountType } from '../enums/account-type.enum';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { SavingsGoal } from './savings-goal.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type!: AccountType;

  @Column({ length: 3 })
  currency!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  initialBalance!: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  currentBalance!: string;

  @Column({ default: false })
  isArchived!: boolean;

  @ManyToOne(() => User, (user) => user.accounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions!: Transaction[];

  @OneToMany(() => SavingsGoal, (goal) => goal.account)
  savingsGoals!: SavingsGoal[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
