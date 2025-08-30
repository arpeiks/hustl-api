import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { TokenService } from '@/services/token.service';
import { CurrencyController } from './currency.controller';

@Module({
  exports: [CurrencyService],
  controllers: [CurrencyController],
  providers: [CurrencyService, TokenService],
})
export class CurrencyModule {}
