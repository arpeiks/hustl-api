import * as Dto from './dto';
import { RESPONSE } from '@/response';
import { VERSION_ONE } from '@/consts';
import { TUser } from '@/modules/drizzle/schema';
import { NotificationService } from './notification.service';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { ReqUser } from '@/modules/auth/decorators/user.decorator';
import { Controller, Get, Put, Body, Version, Delete, Param } from '@nestjs/common';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Auth()
  @Put(':id/read')
  @Version(VERSION_ONE)
  async markAsRead(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.notificationService.markAsRead(user, id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('read-all')
  @Version(VERSION_ONE)
  async markAllAsRead(@ReqUser() user: TUser) {
    const data = await this.notificationService.markAllAsRead(user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Get('settings')
  @Version(VERSION_ONE)
  async getNotificationSettings(@ReqUser() user: TUser) {
    const data = await this.notificationService.getNotificationSettings(user);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Put('settings')
  @Version(VERSION_ONE)
  async updateNotificationSettings(@ReqUser() user: TUser, @Body() body: Dto.UpdateNotificationSettingsBody) {
    const data = await this.notificationService.updateNotificationSettings(user, body);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Auth()
  @Delete(':id')
  @Version(VERSION_ONE)
  async deleteNotification(@ReqUser() user: TUser, @Param('id') id: number) {
    const data = await this.notificationService.deleteNotification(user, id);
    return { data, message: RESPONSE.SUCCESS };
  }

  @Get()
  @Auth()
  @Version(VERSION_ONE)
  async getNotifications(@ReqUser() user: TUser) {
    const data = await this.notificationService.getNotifications(user);
    return { data, message: RESPONSE.SUCCESS };
  }
}
