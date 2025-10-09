import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TokenService } from '@/services/token.service';
import { PaystackModule } from '@/modules/paystack/paystack.module';

@Module({
  exports: [OrderService],
  imports: [PaystackModule],
  controllers: [OrderController],
  providers: [OrderService, TokenService],
})
export class OrderModule {}
