import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsBody {
  @IsBoolean()
  @IsOptional()
  map?: boolean;

  @IsBoolean()
  @IsOptional()
  chat?: boolean;

  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  phone?: boolean;

  @IsBoolean()
  @IsOptional()
  order?: boolean;
}
