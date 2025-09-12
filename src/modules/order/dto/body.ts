import {
  IsIn,
  IsInt,
  IsEmail,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';

import {
  OrderStatusMap,
  TOrderStatus,
  PaymentStatusMap,
  TPaymentStatus,
  OrderItemStatusMap,
  TOrderItemStatus,
} from '@/modules/drizzle/schema';

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

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  paymentProvider: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  @IsOptional()
  shippingMethodId?: number;

  @IsBoolean()
  @IsOptional()
  useEscrow?: boolean;
}

export class CreatePaymentDetailsBody {
  @IsString()
  paymentProvider: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  fees?: number;

  @IsNumber()
  netAmount: number;

  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @IsString()
  @IsOptional()
  externalReference?: string;

  @IsBoolean()
  @IsOptional()
  isEscrow?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(PaymentStatusMap)
  status?: TPaymentStatus;
}

export class UpdateOrderStatusBody {
  @IsString()
  @IsIn(OrderStatusMap)
  status: TOrderStatus;
}

export class DispatchOrderBody {
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  carrier?: string;
}

export class MarkDeliveredBody {
  @IsString()
  @IsOptional()
  deliveryNotes?: string;
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

export class UpdateOrderItemStatusBody {
  @IsString()
  @IsIn(OrderItemStatusMap)
  status: TOrderItemStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
