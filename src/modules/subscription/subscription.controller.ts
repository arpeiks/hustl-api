import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '../drizzle/schema';
import { Auth } from '../auth/decorators/auth.decorator';
import { ReqUser } from '../auth/decorators/user.decorator';
import { SubscriptionService } from './subscription.service';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Version } from '@nestjs/common';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('/feature')
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleCreateFeature(@Body() body: Dto.CreateFeatureBody) {
    const data = await this.subscriptionService.HandleCreateFeature(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('/feature')
  @Version(VERSION_ONE)
  async HandleGetFeatures(@Query() query: Dto.GetFeaturesQuery) {
    const data = await this.subscriptionService.HandleGetFeatures(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('feature/:id')
  @Version(VERSION_ONE)
  async HandleGetFeatureById(@Param('id') id: number) {
    const data = await this.subscriptionService.HandleGetFeatureById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Put('feature/:id')
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleUpdateFeature(@Param('id') id: number, @Body() body: Dto.UpdateFeatureBody) {
    const data = await this.subscriptionService.HandleUpdateFeature(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Version(VERSION_ONE)
  @Delete('feature/:id')
  @Auth({ roles: ['admin'] })
  async HandleDeleteFeature(@Param('id') id: number) {
    await this.subscriptionService.HandleDeleteFeature(id);
    return { message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('/plan')
  @Version(VERSION_ONE)
  async HandleGetSubscriptionPlans(@Query() query: Dto.GetSubscriptionPlansQuery) {
    const data = await this.subscriptionService.HandleGetSubscriptionPlans(query);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Post('/plan')
  @Version(VERSION_ONE)
  @Auth({ roles: ['admin'] })
  async HandleCreateSubscriptionPlan(@Body() body: Dto.CreateSubscriptionPlanBody) {
    const data = await this.subscriptionService.HandleCreateSubscriptionPlan(body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('/plan/:id')
  async HandleGetSubscriptionPlanById(@Param('id') id: number) {
    const data = await this.subscriptionService.HandleGetSubscriptionPlanById(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Put('/plan/:id')
  @Auth({ roles: ['admin'] })
  async HandleUpdateSubscriptionPlan(@Param('id') id: number, @Body() body: Dto.UpdateSubscriptionPlanBody) {
    const data = await this.subscriptionService.HandleUpdateSubscriptionPlan(id, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Delete('/plan/:id')
  @Auth({ roles: ['admin'] })
  async HandleDeleteSubscriptionPlan(@Param('id') id: number) {
    const data = await this.subscriptionService.HandleDeleteSubscriptionPlan(id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Post('/subscribe')
  async HandleSubscribe(@ReqUser() user: TUser, @Body() body: Dto.SubscribeBody) {
    const data = await this.subscriptionService.HandleSubscribe(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('/cancel')
  async HandleCancelSubscription(@ReqUser() user: TUser) {
    const userSubscription = await this.subscriptionService.HandleCancelSubscription(user);
    return { success: true, data: userSubscription };
  }

  @Auth()
  @Get('/')
  async HandleGetSubscriptions(@ReqUser() user: TUser, @Query() query: Dto.GetSubscriptionsQuery) {
    const subscriptions = await this.subscriptionService.HandleGetSubscriptions(user, query);
    return { success: true, data: subscriptions };
  }
}
