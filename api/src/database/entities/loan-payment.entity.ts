import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Loan } from './loan.entity';

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

  @CreateDateColumn()
  createdAt!: Date;
}
