import { Module } from '@nestjs/common';
import { TokenService } from '@/services/token.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  exports: [SubscriptionService],
  controllers: [SubscriptionController],
  providers: [TokenService, SubscriptionService],
})
export class SubscriptionModule {}
