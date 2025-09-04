import { IsString, IsNumber, IsOptional, IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBrandBody {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBrandBody {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateCategoryBody {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class UpdateCategoryBody {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class CreateSizeBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsNumber()
  @IsOptional()
  categoryId: number;
}

export class UpdateSizeBody {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsInt()
  @IsOptional()
  isActive?: number;
}

export class GetCatalogQuery {
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

export class CreateProductBody {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  currencyId: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;
}

export class UpdateProductBody {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  currencyId?: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;
}

export class AddToCartBody {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  productSizeId?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}

export class UpdateCartItemBody {
  @IsNumber()
  @IsOptional()
  quantity?: number;
}

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
  paymentMethod?: string;
}

export class UpdateOrderStatusBody {
  @IsString()
  status: string;
}
