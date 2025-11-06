import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class ExpoService {
  private readonly expo: Expo;

  constructor(private readonly config: ConfigService) {
    const accessToken = this.config.get<string>('EXPO_ACCESS_TOKEN');
    this.expo = new Expo({ accessToken, useFcmV1: true });
  }

  isExpoPushToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }

  async sendPushNotification(pushToken: string, notification: ExpoPushMessage) {
    if (!this.isExpoPushToken(pushToken)) return;
    const payloadDefaults = {
      priority: (notification as any).priority ?? 'high',
      channelId: (notification as any).channelId ?? 'default',
      mutableContent: (notification as any).mutableContent ?? true,
      contentAvailable: (notification as any).contentAvailable ?? true,
    } as Partial<ExpoPushMessage> & Record<string, any>;

    const payload: ExpoPushMessage = {
      ...payloadDefaults,
      ...notification,
      to: pushToken,
      sound: notification.sound ?? 'default',
    } as ExpoPushMessage;

    return await this.expo.sendPushNotificationsAsync([payload]);
  }
}
