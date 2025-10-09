import { IsOptional, IsString } from 'class-validator';

export class GetBanksQuery {
  @IsString()
  @IsOptional()
  country?: string;
}
