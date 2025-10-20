import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TokenService } from '@/services/token.service';
import { ProductModule } from '@/modules/product/product.module';
import { PaystackModule } from '@/modules/paystack/paystack.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  exports: [OrderService],
  controllers: [OrderController],
  providers: [OrderService, TokenService],
  imports: [PaystackModule, NotificationModule, ProductModule],
})
export class OrderModule {}
