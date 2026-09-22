import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { AccountType } from '../../database/enums/account-type.enum';

export class CreateAccountDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsString()
  initialBalance!: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
