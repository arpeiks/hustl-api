import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { CurrencyService } from './currency.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Version } from '@nestjs/common';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get(':id')
  @Version(VERSION_ONE)
  async HandleGetCurrencyById(@Param('id') id: number) {
    const data = await this.currencyService.HandleGetCurrencyById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Put(':id')
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleUpdateCurrency(@Param('id') id: number, @Body() body: Dto.UpdateCurrencyBody) {
    const data = await this.currencyService.HandleUpdateCurrency(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Delete(':id')
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleDeleteCurrency(@Param('id') id: number) {
    await this.currencyService.HandleDeleteCurrency(id);
    return { message: RESPONSE.SUCCESS };
  }

  @Post()
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleCreateCurrency(@Body() body: Dto.CreateCurrencyBody) {
    const data = await this.currencyService.HandleCreateCurrency(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Version(VERSION_ONE)
  async HandleGetCurrencies(@Query() query: Dto.GetCurrenciesQuery) {
    const data = await this.currencyService.HandleGetCurrencies(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
