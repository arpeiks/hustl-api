import { PaystackWebhookService } from './webhook.service';
import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('webhook')
export class PaystackWebhookController {
  constructor(private readonly webhookService: PaystackWebhookService) {}

  @Post('paystack')
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(@Body() body: any, @Headers() headers: any) {
    return await this.webhookService.handleWebhook(body, headers);
  }
}
