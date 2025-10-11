import { OrderStatusMap, TOrderStatus } from '@/modules/drizzle/schema';
import { IsIn, IsInt, IsEmail, IsString, IsNumber, IsOptional, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CheckoutBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsNumber()
  @IsOptional()
  shippingMethodId?: number;
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

export class MarkItemDeliveredBody {
  @IsInt()
  @IsNotEmpty()
  orderItemId: number;
}

export class MarkOrderDeliveredBody {
  @IsInt()
  @IsNotEmpty()
  orderId: number;
}
