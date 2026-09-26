import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Transaction } from '../database/entities/transaction.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAllForUser(userId: string) {
    return this.categoryRepository.find({
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

  async findOneForUser(categoryId: string, userId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        user: {
          id: userId,
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: {
        id: userId,
      },
    });

    return this.categoryRepository.save(category);
  }

  async update(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    const category = await this.findOneForUser(categoryId, userId);

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(categoryId: string, userId: string) {
    const category = await this.findOneForUser(categoryId, userId);

    const transactionCount = await this.transactionRepository.count({
      where: { category: { id: categoryId } },
    });

    if (transactionCount > 0) {
      throw new ConflictException(
        'This category has existing transactions and cannot be deleted. Archive it instead.',
      );
    }

    await this.categoryRepository.remove(category);

    return {
      message: 'Category deleted successfully',
    };
  }
}
