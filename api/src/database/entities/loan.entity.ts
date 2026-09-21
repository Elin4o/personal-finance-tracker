import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { LoanPayment } from './loan-payment.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  personName!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => User, (user) => user.loans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => LoanPayment, (payment) => payment.loan)
  payments!: LoanPayment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
