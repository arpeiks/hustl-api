import { Module } from '@nestjs/common';
import { TokenService } from '@/services/token.service';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  controllers: [OrderController],
  providers: [TokenService, OrderService],
})
export class OrderModule {}


