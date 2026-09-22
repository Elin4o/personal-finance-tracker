import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-request';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriesService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') categoryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.findOneForUser(categoryId, user.userId);
  }

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.create(createCategoryDto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.update(
      categoryId,
      updateCategoryDto,
      user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') categoryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.categoriesService.remove(categoryId, user.userId);
  }
}
