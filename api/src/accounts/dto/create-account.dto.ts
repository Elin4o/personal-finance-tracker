import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AccountType } from '../../database/enums/account-type.enum';
import { SUPPORTED_CURRENCY_CODES } from '../../common/currencies';

export class CreateAccountDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsString()
  @IsIn(SUPPORTED_CURRENCY_CODES)
  currency!: string;

  @IsString()
  initialBalance!: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
