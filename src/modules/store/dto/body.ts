import { IsString, IsNumber, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateStoreBody {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsString()
  @IsOptional()
  businessHours?: string;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  payoutSchedule?: string;
}

export class UpdateStoreBody {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsString()
  @IsOptional()
  businessHours?: string;

  @IsNumber()
  @IsOptional()
  deliveryRadius?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  payoutSchedule?: string;
}

export class GetStoreQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
  pageSize: number;

  @IsInt()
  @IsOptional()
  isActive?: number;
}
