import BaseAxios from 'axios';
import { PAYSTACK } from '@/consts';
import * as Utils from '@/utils';
import { ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackWebhookService } from './webhook.service';
import { PaystackWebhookController } from './webhook.controller';
import { NotificationModule } from '../notification/notification.module';

const PaystackAxios = {
  inject: [ConfigService],
  provide: PAYSTACK.AXIOS,
  useFactory: (config: ConfigService) => {
    const key = config.getOrThrow('PAYSTACK_SECRET_KEY');
    const token = Utils.getPaystackAuthorizationHeader(key);
    const axios = BaseAxios.create({
      baseURL: PAYSTACK.BASE_URL,
      headers: { common: { 'Content-Type': 'application/json', Authorization: token } },
    });
    return axios;
  },
};

@Global()
@Module({
  exports: [PaystackService],
  imports: [NotificationModule],
  controllers: [PaystackWebhookController],
  providers: [PaystackService, PaystackWebhookService, PaystackAxios],
})
export class PaystackModule {}
