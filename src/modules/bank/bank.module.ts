import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { PaystackModule } from '@/modules/paystack/paystack.module';

@Module({
  providers: [BankService],
  imports: [PaystackModule],
  controllers: [BankController],
})
export class BankModule {}
