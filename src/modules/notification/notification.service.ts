import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NotificationSetting, TUser } from '../drizzle/schema';

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
}
