import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TokenService } from '@/services/token.service';

@Module({
  exports: [CartService],
  controllers: [CartController],
  providers: [CartService, TokenService],
})
export class CartModule {}
