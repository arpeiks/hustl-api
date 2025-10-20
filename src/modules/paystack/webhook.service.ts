import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { Order, PaymentDetails } from '../drizzle/schema';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaystackWebhookService {
  constructor(
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly notificationService: NotificationService,
  ) {}

  async handleWebhook(body: any, headers: any) {
    const signature = headers['x-paystack-signature'];

    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const event = body.event;
    const data = body.data;

    switch (event) {
      case 'charge.success':
        await this.handlePaymentSuccess(data);
        break;
      case 'charge.failed':
        await this.handlePaymentFailed(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { status: 'success' };
  }

  private async handlePaymentSuccess(data: any) {
    const reference = data.reference;

    const paymentDetails = await this.db.query.PaymentDetails.findFirst({
      where: eq(PaymentDetails.externalReference, reference),
      with: { order: { with: { orderItems: true } } },
    });

    if (!paymentDetails) {
      console.log(`Payment details not found for reference: ${reference}`);
      return;
    }

    await this.db
      .update(PaymentDetails)
      .set({
        status: 'paid',
        externalTransactionId: data.id,
        updatedAt: new Date(),
      })
      .where(eq(PaymentDetails.id, paymentDetails.id));

    await this.db
      .update(Order)
      .set({
        paymentStatus: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(Order.id, paymentDetails.orderId));

    await this.notificationService.notifyPaymentSuccess(paymentDetails.order);
  }

  private async handlePaymentFailed(data: any) {
    const reference = data.reference;

    const paymentDetails = await this.db.query.PaymentDetails.findFirst({
      where: eq(PaymentDetails.externalReference, reference),
      with: { order: true },
    });

    if (!paymentDetails) {
      console.log(`Payment details not found for reference: ${reference}`);
      return;
    }

    await this.db
      .update(PaymentDetails)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(PaymentDetails.id, paymentDetails.id));

    await this.db
      .update(Order)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(Order.id, paymentDetails.orderId));

    await this.notificationService.notifyPaymentFailed(paymentDetails.order);
  }
}
