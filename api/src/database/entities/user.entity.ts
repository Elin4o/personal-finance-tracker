import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { Loan } from './loan.entity';
import { SavingsGoal } from './savings-goal.entity';
import { NotificationSettings } from './notification-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => Loan, (loan) => loan.user)
  loans!: Loan[];

  @OneToMany(() => SavingsGoal, (goal) => goal.user)
  savingsGoals!: SavingsGoal[];

  @OneToOne(
    () => NotificationSettings,
    (notificationSettings) => notificationSettings.user,
  )
  notificationSettings!: NotificationSettings;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
