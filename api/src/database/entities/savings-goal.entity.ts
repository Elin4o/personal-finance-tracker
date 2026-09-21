import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';

@Entity('savings_goals')
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  targetAmount!: string;

  @Column({ length: 3 })
  currency!: string;

  @Column({ type: 'timestamptz', nullable: true })
  targetDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => User, (user) => user.savingsGoals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Account, (account) => account.savingsGoals, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  account!: Account | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
