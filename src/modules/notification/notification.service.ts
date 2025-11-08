import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and, desc } from 'drizzle-orm';
import { ExpoService } from './expo.service';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NotificationSetting, Notification, TUser, Order, Store, Product, User } from '../drizzle/schema';

export enum NotificationType {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PRODUCT_REVIEW = 'PRODUCT_REVIEW',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  ORDER_ITEM_SHIPPED = 'ORDER_ITEM_SHIPPED',
  NEW_ORDER_FOR_STORE = 'NEW_ORDER_FOR_STORE',
  ORDER_ITEM_CONFIRMED = 'ORDER_ITEM_CONFIRMED',
  ORDER_ITEM_CANCELLED = 'ORDER_ITEM_CANCELLED',
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly expo: ExpoService,
  ) {}

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

  async markAsRead(user: TUser, notificationId: number) {
    const notification = await this.db.query.Notification.findFirst({
      where: and(eq(Notification.id, notificationId), eq(Notification.userId, user.id)),
    });

    if (!notification) throw new NotFoundException('notification not found');

    await this.db
      .update(Notification)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(Notification.id, notificationId));

    return {};
  }

  async markAllAsRead(user: TUser) {
    await this.db
      .update(Notification)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(Notification.userId, user.id), eq(Notification.isRead, false)));

    return {};
  }

  async createNotification(userId: number, type: NotificationType, title: string, message: string) {
    const [notification] = await this.db
      .insert(Notification)
      .values({ userId, type, title, message, isRead: false })
      .returning();

    return notification;
  }

  async notifyOrderPlaced(order: any) {
    const buyerNotification = await this.createNotification(
      order.buyerId,
      NotificationType.ORDER_PLACED,
      'Order Placed Successfully',
      `Your order #${order.orderNumber} has been placed successfully. Total: ₦${(order.total / 100).toFixed(2)}`,
    );

    await this.expo.sendPushNotification(order.buyer.auth.pushToken, {
      data: buyerNotification,
      to: order.buyer.auth.pushToken,
      title: 'Order Placed Successfully',
      body: `Your order #${order.orderNumber} has been placed successfully. Total: ₦${(order.total / 100).toFixed(2)}`,
    });

    const storeOwners = new Map<number, any>();

    for (const item of order.orderItems) {
      if (!storeOwners.has(item.storeId)) {
        const store = await this.db.query.Store.findFirst({
          where: eq(Store.id, item.storeId),
          with: { owner: true },
        });
        if (store) {
          storeOwners.set(item.storeId, store);
        }
      }
    }

    for (const [_storeId, store] of storeOwners) {
      const storeOwnerNotification = await this.createNotification(
        store.owner.id,
        NotificationType.NEW_ORDER_FOR_STORE,
        'New Order Received',
        `You have received a new order #${order.orderNumber} for ₦${(order.total / 100).toFixed(2)}`,
      );

      await this.expo.sendPushNotification(store.owner.auth.pushToken, {
        to: store.owner.auth.pushToken,
        title: 'New Order Received',
        data: storeOwnerNotification,
        body: `You have received a new order #${order.orderNumber} for ₦${(order.total / 100).toFixed(2)}`,
      });
    }

    return buyerNotification;
  }

  async notifyOrderStatusChange(order: any, _oldStatus: string, newStatus: string) {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed by the store',
      processing: 'Your order is now being processed',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'Your order has been cancelled',
      refunded: 'Your order has been refunded',
    };

    const statusTitles: Record<string, string> = {
      confirmed: 'Order Confirmed',
      processing: 'Order Processing',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled',
      refunded: 'Order Refunded',
    };

    if (statusMessages[newStatus] && statusTitles[newStatus]) {
      const buyerNotification = await this.createNotification(
        order.buyerId,
        NotificationType[`ORDER_${newStatus.toUpperCase()}` as keyof typeof NotificationType],
        statusTitles[newStatus],
        `${statusMessages[newStatus]} - Order #${order.orderNumber}`,
      );

      await this.expo.sendPushNotification(order.buyer.auth.pushToken, {
        data: buyerNotification,
        to: order.buyer.auth.pushToken,
        title: statusTitles[newStatus],
        body: `${statusMessages[newStatus]} - Order #${order.orderNumber}`,
      });
    }
  }

  async notifyOrderItemStatusChange(orderItem: any, _oldStatus: string, newStatus: string) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderItem.orderId),
      with: { buyer: { with: { auth: true } } },
    });

    if (!order) return;

    const product = await this.db.query.Product.findFirst({
      where: eq(Product.id, orderItem.productId),
    });

    const statusMessages: Record<string, string> = {
      confirmed: 'has been confirmed by the store',
      processing: 'is now being processed',
      shipped: 'has been shipped and is on its way',
      delivered: 'has been delivered successfully',
      cancelled: 'has been cancelled',
    };

    const statusTitles: Record<string, string> = {
      confirmed: 'Order Item Confirmed',
      processing: 'Order Item Processing',
      shipped: 'Order Item Shipped',
      delivered: 'Order Item Delivered',
      cancelled: 'Order Item Cancelled',
    };

    if (statusMessages[newStatus] && statusTitles[newStatus]) {
      const buyerNotification = await this.createNotification(
        order.buyerId,
        NotificationType[`ORDER_ITEM_${newStatus.toUpperCase()}` as keyof typeof NotificationType],
        statusTitles[newStatus],
        `Your ${product?.name || 'item'} ${statusMessages[newStatus]} - Order #${order.orderNumber}`,
      );

      if (order?.buyer?.auth?.pushToken) {
        await this.expo.sendPushNotification(order.buyer.auth.pushToken, {
          data: buyerNotification,
          to: order.buyer.auth.pushToken,
          title: statusTitles[newStatus],
          body: `Your ${product?.name || 'item'} ${statusMessages[newStatus]} - Order #${order.orderNumber}`,
        });
      }
    }
  }

  async notifyPaymentSuccess(order: any) {
    const buyerNotification = await this.createNotification(
      order.buyerId,
      NotificationType.PAYMENT_SUCCESS,
      'Payment Successful',
      `Payment for order #${order.orderNumber} has been processed successfully. Amount: ₦${(order.total / 100).toFixed(2)}`,
    );

    await this.expo.sendPushNotification(order.buyer.auth.pushToken, {
      data: buyerNotification,
      title: 'Payment Successful',
      to: order.buyer.auth.pushToken,
      body: `Payment for order #${order.orderNumber} has been processed successfully. Amount: ₦${(order.total / 100).toFixed(2)}`,
    });

    const storeOwners = new Map<number, any>();

    for (const item of order.orderItems) {
      if (!storeOwners.has(item.storeId)) {
        const store = await this.db.query.Store.findFirst({
          where: eq(Store.id, item.storeId),
          with: { owner: true },
        });
        if (store) {
          storeOwners.set(item.storeId, store);
        }
      }
    }

    for (const [_storeId, store] of storeOwners) {
      const storeOwnerNotification = await this.createNotification(
        store.owner.id,
        NotificationType.PAYMENT_RECEIVED,
        'Payment Received',
        `Payment received for order #${order.orderNumber}. Amount: ₦${(order.total / 100).toFixed(2)}`,
      );

      await this.expo.sendPushNotification(store.owner.auth.pushToken, {
        title: 'Payment Received',
        data: storeOwnerNotification,
        to: store.owner.auth.pushToken,
        body: `Payment received for order #${order.orderNumber}. Amount: ₦${(order.total / 100).toFixed(2)}`,
      });
    }
  }

  async notifyPaymentFailed(order: any) {
    const buyerNotification = await this.createNotification(
      order.buyerId,
      NotificationType.PAYMENT_FAILED,
      'Payment Failed',
      `Payment for order #${order.orderNumber} has failed. Please try again or contact support.`,
    );

    await this.expo.sendPushNotification(order.buyer.auth.pushToken, {
      title: 'Payment Failed',
      data: buyerNotification,
      to: order.buyer.auth.pushToken,
      body: `Payment for order #${order.orderNumber} has failed. Please try again or contact support.`,
    });
  }

  async notifyLowStock(product: any, storeOwnerId: number) {
    const storeOwner = await this.db.query.Store.findFirst({
      where: eq(Store.id, product.storeId),
      with: { owner: { with: { auth: true } } },
    });

    if (!storeOwner) return;

    const storeOwnerNotification = await this.createNotification(
      storeOwnerId,
      NotificationType.LOW_STOCK_ALERT,
      'Low Stock Alert',
      `Your product "${product.name}" is running low on stock. Current stock: ${product.stockQuantity}`,
    );

    if (storeOwner?.owner?.auth?.pushToken) {
      await this.expo.sendPushNotification(storeOwner.owner.auth.pushToken, {
        title: 'Low Stock Alert',
        data: storeOwnerNotification,
        to: storeOwner.owner.auth.pushToken,
        body: `Your product "${product.name}" is running low on stock. Current stock: ${product.stockQuantity}`,
      });
    }
  }

  async notifyProductReview(product: any, review: any, storeOwnerId: number) {
    const storeOwner = await this.db.query.Store.findFirst({
      where: eq(Store.id, product.storeId),
      with: { owner: { with: { auth: true } } },
    });

    if (!storeOwner) return;

    const storeOwnerNotification = await this.createNotification(
      storeOwnerId,
      NotificationType.PRODUCT_REVIEW,
      'New Product Review',
      `Your product "${product.name}" received a new ${review.rating}-star review`,
    );

    if (storeOwner?.owner?.auth?.pushToken) {
      await this.expo.sendPushNotification(storeOwner.owner.auth.pushToken, {
        title: 'New Product Review',
        data: storeOwnerNotification,
        to: storeOwner.owner.auth.pushToken,
        body: `Your product "${product.name}" received a new ${review.rating}-star review`,
      });
    }
  }

  async sendPushNotificationToUser(body: Dto.SendPushNotificationBody) {
    const user = await this.db.query.User.findFirst({
      where: eq(User.id, body.id),
      with: { auth: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.auth?.pushToken) throw new NotFoundException('User does not have a push token');

    const notificationPayload: any = {
      to: user.auth.pushToken,
      title: body.title || 'Notification',
      body: body.body || 'You have a new notification',
    };

    if (body.includeData === true && body.data) {
      notificationPayload.data = body.data;
    }

    await this.expo.sendPushNotification(user.auth.pushToken, notificationPayload);

    return { success: true, message: 'Push notification sent successfully' };
  }
}
