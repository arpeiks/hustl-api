import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetSubscriptionsQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @IsInt()
  @IsOptional()
  isActive?: number;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}

export class GetFeaturesQuery extends GetSubscriptionsQuery {}
export class GetSubscriptionPlansQuery extends GetSubscriptionsQuery {}
export class GetSubscriptionPlanByIdQuery extends GetSubscriptionsQuery {}
