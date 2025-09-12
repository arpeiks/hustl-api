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
  //

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

  @Auth()
  @Put(':id/dispatch')
  @Version(VERSION_ONE)
  async dispatchOrder(@Param('id') id: number, @ReqUser() user: TUser, @Body() body: Dto.DispatchOrderBody) {
    const data = await this.orderService.dispatchOrder(id, user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put(':id/delivered')
  @Version(VERSION_ONE)
  async markAsDelivered(@Param('id') id: number, @ReqUser() user: TUser, @Body() body: Dto.MarkDeliveredBody) {
    const data = await this.orderService.markAsDelivered(id, user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post(':id/payment')
  @Version(VERSION_ONE)
  async createPaymentDetails(@Param('id') orderId: number, @Body() body: Dto.CreatePaymentDetailsBody) {
    const data = await this.orderService.createPaymentDetails(orderId, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('payment/:id/status')
  @Version(VERSION_ONE)
  async updatePaymentStatus(@Param('id') paymentId: number, @Body() body: { status: string; gatewayResponse?: any }) {
    const data = await this.orderService.updatePaymentStatus(paymentId, body.status, body.gatewayResponse);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('payment/:id/release-escrow')
  @Version(VERSION_ONE)
  async releaseEscrow(@Param('id') paymentId: number) {
    const data = await this.orderService.releaseEscrow(paymentId);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get(':id/timeline')
  @Version(VERSION_ONE)
  async getOrderTimeline(@Param('id') id: number) {
    const data = await this.orderService.getOrderTimeline(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('analytics')
  @Version(VERSION_ONE)
  async getOrderAnalytics(@Query() query: { storeId?: number; startDate?: string; endDate?: string }) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const data = await this.orderService.getOrderAnalytics(query.storeId, startDate, endDate);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('item/:itemId/status')
  @Version(VERSION_ONE)
  async updateOrderItemStatus(
    @Param('itemId') itemId: number,
    @ReqUser() user: TUser,
    @Body() body: Dto.UpdateOrderItemStatusBody,
  ) {
    const data = await this.orderService.updateOrderItemStatus(itemId, user, body);
    return { data, message: RESPONSE.SUCCESS };
  }
}
