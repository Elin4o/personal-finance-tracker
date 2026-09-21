import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryType } from '../enums/category-type.enum';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type!: CategoryType;

  @Column({ default: false })
  isArchived!: boolean;

  @ManyToOne(() => User, (user) => user.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
