import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '@/modules/drizzle/schema';
import { OrderService } from './order.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Controller, Get, Post, Put, Body, Version, Query, Param } from '@nestjs/common';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  @Version(VERSION_ONE)
  async createOrder(@ReqUser() user: TUser, @Body() body: Dto.CreateOrderBody) {
    const data = await this.orderService.createOrder(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('buyer')
  @Version(VERSION_ONE)
  async getBuyerOrders(@ReqUser() user: TUser, @Query() query: Dto.GetOrdersQuery) {
    const data = await this.orderService.getOrders(user, query, 'buyer');
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('vendor')
  @Version(VERSION_ONE)
  async getVendorOrders(@ReqUser() user: TUser, @Query() query: Dto.GetOrdersQuery) {
    const data = await this.orderService.getOrders(user, query, 'vendor');
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get(':id')
  @Version(VERSION_ONE)
  async getOrderById(@Param('id') id: number) {
    const data = await this.orderService.getOrderById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/status')
  @Version(VERSION_ONE)
  async updateOrderStatus(@ReqUser() user: TUser, @Param('id') id: number, @Body() body: Dto.UpdateOrderStatusBody) {
    const data = await this.orderService.updateOrderStatus(user, id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/cancel')
  @Version(VERSION_ONE)
  async cancelOrder(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.orderService.cancelOrder(user, id);
    return { data, message: RESPONSE.SUCCESS };
  }
}
