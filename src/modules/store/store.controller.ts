import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { StoreService } from './store.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Get, Put, Body, Query, Param, Version, Controller } from '@nestjs/common';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Auth()
  @Get(':id/earnings')
  @Version(VERSION_ONE)
  async getDashboardStats(@Param('id') id: number) {
    const data = await this.storeService.getDashboardStats(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get(':id/stats')
  @Version(VERSION_ONE)
  async getQuickStats(@Param('id') id: number) {
    const data = await this.storeService.getQuickStats(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Get(':id/activities')
  async getRecentActivities(@Param('id') id: number) {
    const data = await this.storeService.getRecentActivities(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/bank')
  @Version(VERSION_ONE)
  async updateBank(@ReqUser() user: TUser, @Param('id') id: number, @Body() body: Dto.UpdateBankBody) {
    const data = await this.storeService.updateBank(id, user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get(':id')
  @Version(VERSION_ONE)
  async getStoreById(@Param('id') id: number) {
    const data = await this.storeService.getStoreById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id')
  @Version(VERSION_ONE)
  async updateStore(@Param('id') id: number, @ReqUser() user: TUser, @Body() body: Dto.UpdateStoreBody) {
    const data = await this.storeService.updateStore(id, user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async getStores(@Query() query: Dto.GetStoreQuery) {
    const data = await this.storeService.getStores(query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
