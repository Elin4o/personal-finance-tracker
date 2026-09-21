import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: true })
  emailEnabled!: boolean;

  @Column({ default: false })
  pushEnabled!: boolean;

  @Column({ default: true })
  loanRemindersEnabled!: boolean;

  @Column({ default: true })
  savingsGoalRemindersEnabled!: boolean;

  @OneToOne(() => User, (user) => user.notificationSettings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
