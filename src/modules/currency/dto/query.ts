import { IsOptional, IsString, IsInt } from 'class-validator';

export class GetCurrenciesQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @IsInt()
  @IsOptional()
  isActive?: number;

  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  pageSize?: number;
}
