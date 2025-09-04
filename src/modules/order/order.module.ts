import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TokenService } from '@/services/token.service';

@Module({
  exports: [OrderService],
  controllers: [OrderController],
  providers: [OrderService, TokenService],
})
export class OrderModule {}
