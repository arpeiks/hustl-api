import { Get, Put, Post, Body, Query, Param, Version, Controller } from '@nestjs/common';
import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { OrderService } from './order.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  @Version(VERSION_ONE)
  async createOrder(@ReqUser('id') userId: number, @Body() body: Dto.CreateOrderBody) {
    const data = await this.orderService.createOrder(userId, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get()
  @Version(VERSION_ONE)
  async getOrders(@Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.getOrders(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('my/orders')
  @Version(VERSION_ONE)
  async getMyOrders(@ReqUser('id') userId: number, @Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.getBuyerOrders(userId, query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('vendor/orders')
  @Version(VERSION_ONE)
  async getVendorOrders(@ReqUser('id') userId: number, @Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.getVendorOrders(userId, query);
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
  async updateOrderStatus(@Param('id') id: number, @Body() body: Dto.UpdateOrderStatusBody) {
    const data = await this.orderService.updateOrderStatus(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/cancel')
  @Version(VERSION_ONE)
  async cancelOrder(@ReqUser('id') userId: number, @Param('id') id: number) {
    const data = await this.orderService.cancelOrder(id, userId);
    return { data, message: RESPONSE.SUCCESS };
  }
}
