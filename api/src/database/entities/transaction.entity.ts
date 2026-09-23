import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
import { LoanPayment } from './loan-payment.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => User, (user) => user.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Account, (account) => account.transactions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  account!: Account;

  @ManyToOne(() => Account, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  transferToAccount!: Account | null;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  category!: Category | null;

  @OneToOne(() => LoanPayment, (loanPayment) => loanPayment.transaction)
  loanPayment!: LoanPayment;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
