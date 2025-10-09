import * as Dto from './dto/index';
import { Injectable } from '@nestjs/common';
import { PaystackService } from '@/modules/paystack/paystack.service';

@Injectable()
export class BankService {
  constructor(private readonly paystack: PaystackService) {}

  async getBanks(query: Dto.GetBanksQuery) {
    const country = query.country || 'nigeria';
    const banks = await this.paystack.fetchBanks(country);
    return banks;
  }
}
