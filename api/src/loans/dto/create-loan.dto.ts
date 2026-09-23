import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { LoanType } from '../../database/enums/loan-type.enum';

export class CreateLoanDto {
  @IsString()
  @MaxLength(200)
  personName!: string;

  @IsString()
  amount!: string;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(LoanType)
  type!: LoanType;

  @IsUUID()
  accountId!: string;
}
