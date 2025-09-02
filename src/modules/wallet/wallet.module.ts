import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TokenService } from '@/services/token.service';
import { WalletController } from './wallet.controller';

@Module({
  exports: [WalletService],
  controllers: [WalletController],
  providers: [TokenService, WalletService],
})
export class WalletModule {}
