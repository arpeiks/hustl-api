import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { TokenService } from '@/services/token.service';
import { ServiceController } from './service.controller';

@Module({
  controllers: [ServiceController],
  providers: [TokenService, ServiceService],
})
export class ServiceModule {}
