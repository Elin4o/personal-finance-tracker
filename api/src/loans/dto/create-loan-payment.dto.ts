import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateLoanPaymentDto {
  @IsUUID()
  loanId!: string;

  @IsUUID()
  accountId!: string;

  @IsString()
  amount!: string;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
