import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';

export class CreateOrderBody {
  @IsNumber()
  vendorId: number;

  @IsArray()
  @Type(() => OrderItemBody)
  items: OrderItemBody[];

  @IsString()
  shippingAddress: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(['wallet', 'card', 'bank_transfer', 'cash'])
  paymentMethod: 'wallet' | 'card' | 'bank_transfer' | 'cash';
}

export class OrderItemBody {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  productSizeId?: number;

  @IsNumber()
  quantity: number;
}

export class UpdateOrderStatusBody {
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
}

export class GetOrdersQuery {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  paymentStatus?: string;
}
