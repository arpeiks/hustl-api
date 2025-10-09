import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { BankService } from './bank.service';
import { Controller, Get, Query, Version } from '@nestjs/common';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @Version(VERSION_ONE)
  async getBanks(@Query() query: Dto.GetBanksQuery) {
    const data = await this.bankService.getBanks(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
