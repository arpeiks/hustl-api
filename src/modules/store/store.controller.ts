import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { StoreService } from './store.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Get, Put, Post, Body, Query, Param, Delete, Version, Controller } from '@nestjs/common';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Auth()
  @Get('my/store')
  @Version(VERSION_ONE)
  async getMyStore(@ReqUser('id') userId: number) {
    const data = await this.storeService.getStoreByOwnerId(userId);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post()
  @Version(VERSION_ONE)
  async createStore(@ReqUser('id') userId: number, @Body() body: Dto.CreateStoreBody) {
    const data = await this.storeService.createStore(userId, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Version(VERSION_ONE)
  async getStores(@Query() query: Dto.GetStoreQuery) {
    const data = await this.storeService.getStores(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get(':id')
  @Version(VERSION_ONE)
  async getStoreById(@Param('id') id: number) {
    const data = await this.storeService.getStoreById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id')
  @Version(VERSION_ONE)
  async updateStore(@Param('id') id: number, @Body() body: Dto.UpdateStoreBody) {
    const data = await this.storeService.updateStore(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/toggle-online')
  @Version(VERSION_ONE)
  async toggleStoreOnline(@Param('id') id: number) {
    const data = await this.storeService.toggleStoreOnline(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete(':id')
  @Version(VERSION_ONE)
  async deleteStore(@Param('id') id: number) {
    const data = await this.storeService.deleteStore(id);
    return { data, message: RESPONSE.SUCCESS };
  }
}
