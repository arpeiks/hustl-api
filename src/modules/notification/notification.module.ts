import { Module } from '@nestjs/common';
import { ExpoService } from './expo.service';
import { TokenService } from '@/services/token.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  exports: [NotificationService, ExpoService],
  providers: [TokenService, NotificationService, ExpoService],
})
export class NotificationModule {}
