import { IsOptional } from 'class-validator';

import { IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() loanRemindersEnabled?: boolean;
  @IsOptional() @IsBoolean() savingsGoalRemindersEnabled?: boolean;
}
