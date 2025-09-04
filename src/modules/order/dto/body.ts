import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { OrderStatusMap, TOrderStatus, TPaymentMethod } from '@/modules/drizzle/schema';

export class CreateOrderBody {
  @IsString()
  shippingAddress: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: TPaymentMethod;
}

export class UpdateOrderStatusBody {
  @IsString()
  @IsIn(OrderStatusMap)
  status: TOrderStatus;
}

export class GetOrderQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
  pageSize: number;

  @IsString()
  @IsOptional()
  @IsIn(OrderStatusMap)
  status?: TOrderStatus;
}
