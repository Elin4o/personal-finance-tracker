import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CategoryType } from '../../database/enums/category-type.enum';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEnum(CategoryType)
  type!: CategoryType;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
