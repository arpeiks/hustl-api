import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TokenService } from '@/services/token.service';

@Module({
  exports: [StoreService],
  controllers: [StoreController],
  providers: [StoreService, TokenService],
})
export class StoreModule {}
