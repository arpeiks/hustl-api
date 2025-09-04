import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and, desc } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NotificationSetting, Notification, TUser } from '../drizzle/schema';

@Injectable()
export class NotificationService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async getNotificationSettings(user: TUser) {
    return await this.db.query.NotificationSetting.findFirst({
      where: and(eq(NotificationSetting.userId, user.id)),
    });
  }

  async updateNotificationSettings(user: TUser, body: Dto.UpdateNotificationSettingsBody) {
    const existingSettings = await this.getNotificationSettings(user);
    if (!existingSettings) throw new NotFoundException('Notification settings not found');

    const [updatedSettings] = await this.db
      .update(NotificationSetting)
      .set({ ...existingSettings, ...body, updatedAt: new Date() })
      .where(eq(NotificationSetting.id, existingSettings.id))
      .returning();

    return updatedSettings;
  }

  async getNotifications(user: TUser) {
    return await this.db.query.Notification.findMany({
      offset: 0,
      limit: 200,
      orderBy: desc(Notification.createdAt),
      where: and(eq(Notification.userId, user.id)),
    });
  }

  async deleteNotification(user: TUser, notificationId: number) {
    const notification = await this.db.query.Notification.findFirst({
      where: and(eq(Notification.id, notificationId), eq(Notification.userId, user.id)),
    });

    if (!notification) throw new NotFoundException('notification not found');

    await this.db.delete(Notification).where(eq(Notification.id, notificationId));
    return {};
  }
}
