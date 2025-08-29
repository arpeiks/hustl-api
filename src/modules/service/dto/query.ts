import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class GetServicesQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @Min(1)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @Min(1)
  @IsInt()
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}
