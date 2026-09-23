import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanPaymentDto } from './create-loan-payment.dto';

export class UpdateLoanPaymentDto extends PartialType(CreateLoanPaymentDto) {}
