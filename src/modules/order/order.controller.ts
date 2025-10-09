import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { OrderService } from './order.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Get, Put, Post, Body, Query, Param, Version, Controller } from '@nestjs/common';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Version(VERSION_ONE)
  @Put('/store/item/:id/accept')
  async HandleAcceptOrderItem(@Param('id') id: number, @ReqUser() user: TUser) {
    const data = await this.orderService.HandleAcceptOrderItem(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Put('/store/item/:id/reject')
  async HandleRejectOrderItem(@Param('id') id: number, @ReqUser() user: TUser) {
    const data = await this.orderService.HandleRejectOrderItem(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Put('/:id/store/accept')
  async HandleAcceptOrder(@Param('id') itemId: number, @ReqUser() user: TUser) {
    const data = await this.orderService.HandleAcceptOrder(itemId, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Put('/:id/store/reject')
  async HandleRejectOrder(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.orderService.HandleRejectOrder(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Get('/store/item/:id')
  async HandleGetStoreOrderItemById(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.orderService.HandleGetStoreOrderItemById(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Version(VERSION_ONE)
  @Get('/:id/store')
  async HandleGetStoreOrderById(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.orderService.HandleGetStoreOrderById(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('store/item')
  @Version(VERSION_ONE)
  async HandleGetStoreOrderItems(@ReqUser() user: TUser, @Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.HandleGetStoreOrderItems(user, query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('store')
  @Version(VERSION_ONE)
  async HandleGetStoreOrders(@ReqUser() user: TUser, @Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.HandleGetStoreOrders(user, query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('checkout')
  @Version(VERSION_ONE)
  async HandleCheckout(@ReqUser() user: TUser, @Body() body: Dto.CheckoutBody) {
    const data = await this.orderService.HandleCheckout(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get(':id')
  @Version(VERSION_ONE)
  async HandleGetOrderById(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.orderService.HandleGetOrderById(id, user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async HandleGetMyOrders(@ReqUser() user: TUser, @Query() query: Dto.GetOrderQuery) {
    const data = await this.orderService.HandleGetMyOrders(user, query);
    return { data, message: RESPONSE.SUCCESS };
  }
}
