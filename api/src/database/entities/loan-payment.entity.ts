import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Loan } from './loan.entity';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';

@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => Loan, (loan) => loan.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  loan!: Loan;

  @ManyToOne(() => Account, (account) => account.loanPayments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  account!: Account;

  @OneToOne(() => Transaction, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction!: Transaction;

  @CreateDateColumn()
  createdAt!: Date;
}
