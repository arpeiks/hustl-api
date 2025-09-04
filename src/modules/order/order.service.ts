import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { Order, OrderItem, Cart, CartItem } from '../drizzle/schema';
import { eq, and, desc, count, ilike } from 'drizzle-orm';
import * as Dto from './dto';

@Injectable()
export class OrderService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async createOrder(userId: number, body: Dto.CreateOrderBody) {
    const cart = await this.db.query.Cart.findFirst({
      where: eq(Cart.userId, userId),
      with: {
        items: {
          with: {
            product: {
              with: { currency: true },
            },
            productSize: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const price = item.productSize?.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        productSizeId: item.productSizeId,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal,
      });
    }

    const tax = Math.round(subtotal * 0.05);
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const [order] = await this.db
      .insert(Order)
      .values({
        orderNumber,
        buyerId: userId,
        vendorId: cart.items[0].product.vendorId,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: body.paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        currencyId: cart.items[0].product.currencyId,
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        notes: body.notes,
      })
      .returning();

    for (const item of orderItems) {
      await this.db.insert(OrderItem).values({
        orderId: order.id,
        ...item,
      });
    }

    await this.db.delete(CartItem).where(eq(CartItem.cartId, cart.id));

    return order;
  }

  async getOrders(query: Dto.GetOrderQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const queryFilter = q ? ilike(Order.orderNumber, q) : undefined;
    const statusFilter = query.status ? eq(Order.status, query.status) : undefined;

    const [stats] = await this.db
      .select({ count: count(Order.id) })
      .from(Order)
      .where(and(statusFilter, queryFilter));

    const data = await this.db.query.Order.findMany({
      limit,
      offset,
      orderBy: desc(Order.createdAt),
      with: {
        buyer: true,
        vendor: true,
        currency: true,
        orderItems: {
          with: {
            product: {
              with: { brand: true, category: true },
            },
            productSize: {
              with: { size: true },
            },
          },
        },
      },
      where: and(statusFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getOrderById(orderId: number) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
      with: {
        buyer: true,
        vendor: true,
        currency: true,
        orderItems: {
          with: {
            product: {
              with: { brand: true, category: true },
            },
            productSize: {
              with: { size: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getBuyerOrders(userId: number, query: Dto.GetOrderQuery) {
    const { limit, offset } = getPage(query);
    const statusFilter = query.status ? eq(Order.status, query.status) : undefined;
    const buyerFilter = eq(Order.buyerId, userId);

    const [stats] = await this.db
      .select({ count: count(Order.id) })
      .from(Order)
      .where(and(buyerFilter, statusFilter));

    const data = await this.db.query.Order.findMany({
      limit,
      offset,
      orderBy: desc(Order.createdAt),
      with: {
        vendor: true,
        currency: true,
        orderItems: {
          with: {
            product: {
              with: { brand: true, category: true },
            },
            productSize: {
              with: { size: true },
            },
          },
        },
      },
      where: and(buyerFilter, statusFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getVendorOrders(userId: number, query: Dto.GetOrderQuery) {
    const { limit, offset } = getPage(query);
    const statusFilter = query.status ? eq(Order.status, query.status) : undefined;
    const vendorFilter = eq(Order.vendorId, userId);

    const [stats] = await this.db
      .select({ count: count(Order.id) })
      .from(Order)
      .where(and(vendorFilter, statusFilter));

    const data = await this.db.query.Order.findMany({
      limit,
      offset,
      orderBy: desc(Order.createdAt),
      with: {
        buyer: true,
        currency: true,
        orderItems: {
          with: {
            product: {
              with: { brand: true, category: true },
            },
            productSize: {
              with: { size: true },
            },
          },
        },
      },
      where: and(vendorFilter, statusFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async updateOrderStatus(orderId: number, body: Dto.UpdateOrderStatusBody) {
    const [order] = await this.db
      .update(Order)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(Order.id, orderId))
      .returning();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== userId && order.vendorId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    const [updatedOrder] = await this.db
      .update(Order)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(Order.id, orderId))
      .returning();

    return updatedOrder;
  }
}
