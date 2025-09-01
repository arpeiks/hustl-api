import { Min, IsIn, IsInt, IsArray, IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { IntervalUnitMap, TIntervalUnit } from '../../drizzle/schema';

export class CreateFeatureBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFeatureBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateSubscriptionPlanBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  currencyId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(IntervalUnitMap)
  intervalUnit: TIntervalUnit;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  intervalCount: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  featureIds: number[];
}

export class UpdateSubscriptionPlanBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  currencyId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(IntervalUnitMap)
  intervalUnit: TIntervalUnit;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  intervalCount: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  featureIds: number[];
}

export class SubscribeBody {
  @IsNumber()
  id: number;
}
