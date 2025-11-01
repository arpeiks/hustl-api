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
    return await this.expo.sendPushNotificationsAsync([{ ...notification, sound: 'default', to: pushToken }]);
  }
}
