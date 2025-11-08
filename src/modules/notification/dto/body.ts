import { IsBoolean, IsOptional, IsNumber, IsString, IsNotEmpty, IsObject } from 'class-validator';

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

export class SendPushNotificationBody {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  includeData?: boolean;
}
