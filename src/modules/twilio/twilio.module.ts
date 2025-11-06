import * as twilio from 'twilio';
import { TWILIO } from '@/consts';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from './twilio.service';

const client = {
  provide: TWILIO,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const authToken = config.getOrThrow('TWILIO_AUTH_TOKEN');
    const accountSid = config.getOrThrow('TWILIO_ACCOUNT_SID');
    return twilio(accountSid, authToken);
  },
};

@Module({
  exports: [TwilioService],
  providers: [TwilioService, client],
})
export class TwilioModule {}
