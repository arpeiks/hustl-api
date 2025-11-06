import { go } from '@/utils';
import * as Dto from './dto';
import { Twilio } from 'twilio';
import { TWILIO } from '@/consts';
import { RESPONSE } from '@/response';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class TwilioService {
  constructor(
    private readonly config: ConfigService,
    @Inject(TWILIO) private readonly client: Twilio,
  ) {
    this.twilioPhoneNumber = this.config.getOrThrow('TWILIO_PHONE_NUMBER');
  }

  private readonly twilioPhoneNumber: string;

  async sendVerificationCode(code: string, to: string): Promise<string | undefined> {
    try {
      const from = this.twilioPhoneNumber;
      const body = `Your Hustl app verification code is: ${code}`;
      const res = await this.createMessage({ to, from, body });
      return res?.status;
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  async sendPasswordResetCode(code: string, to: string): Promise<string | undefined> {
    try {
      const from = this.twilioPhoneNumber;
      const body = `Your Hustl password reset code is: ${code}`;
      const res = await this.createMessage({ to, from, body });
      return res?.status;
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  async sendSMS(payload: Dto.TSendSMS): Promise<string | undefined> {
    try {
      const res = await this.createMessage(payload);
      return res?.status;
    } catch (err) {
      Logger.error(err);
      return undefined;
    }
  }

  private async createMessage(payload: Dto.TSendSMS) {
    const [data, error] = await go(() => this.client.messages.create(payload));
    if (data) return data;
    return this.handleError(error);
  }

  private handleError(error: any): any {
    const cause = error?.response?.data ?? error;
    const technicalMessage = error?.response?.data?.message ?? error?.message ?? 'Unknown error';
    throw new InternalServerErrorException({
      cause,
      technicalMessage,
      message: RESPONSE.SERVER_ERROR,
    });
  }
}
