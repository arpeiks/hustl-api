import { IsNumber, IsOptional } from 'class-validator';

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
