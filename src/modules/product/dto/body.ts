import { IsString, IsOptional, IsArray, IsBoolean, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateProductBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  currencyId: number;

  @IsInt()
  @IsOptional()
  brandId: number;

  @IsInt()
  @IsOptional()
  categoryId: number;

  @IsInt()
  @IsOptional()
  isFeatured?: number;

  @IsInt()
  @IsOptional()
  stockQuantity?: number;
}

export class UpdateProductBody {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  price?: number;

  @IsInt()
  @IsOptional()
  currencyId?: number;

  @IsInt()
  @IsOptional()
  brandId?: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsInt()
  @IsOptional()
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateProductSizeBody {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  sizeId: number;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  stockQuantity: number;
}

export class CreateProductReviewBody {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @Min(1)
  @Max(5)
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class GetProductsQuery {
  @IsString()
  @IsOptional()
  q?: string;

  @IsInt()
  @IsOptional()
  page: number;

  @IsInt()
  @IsOptional()
  pageSize: number = 50;

  @IsInt()
  @IsOptional()
  categoryId: number;

  @IsInt()
  @IsOptional()
  brandId?: number;

  @IsInt()
  @IsOptional()
  vendorId: number;

  @IsInt()
  @IsOptional()
  isFeatured?: number;

  @IsInt()
  @IsOptional()
  isActive?: number;
}
