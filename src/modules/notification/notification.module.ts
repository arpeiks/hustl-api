import { Module } from '@nestjs/common';
import { TokenService } from '@/services/token.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [TokenService, NotificationService],
})
export class NotificationModule {}
