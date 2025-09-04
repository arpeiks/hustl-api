import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and, desc, count, inArray } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderItem, Product, TUser, User } from '../drizzle/schema';
import { generatePagination, getPage } from '@/utils';

@Injectable()
export class OrderService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async createOrder(buyer: TUser, body: Dto.CreateOrderBody) {
    const vendor = await this.db.query.User.findFirst({
      where: eq(User.id, body.vendorId),
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await this.db.query.Product.findMany({
      where: inArray(Product.id, productIds),
      with: { productSizes: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Some products not found');
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      let unitPrice = product.price;
      let stockQuantity = product.stockQuantity;

      if (item.productSizeId) {
        const productSize = product.productSizes.find((ps) => ps.id === item.productSizeId);
        if (!productSize) {
          throw new NotFoundException(`Product size not found for product ${product.id}`);
        }
        unitPrice = productSize.price;
        stockQuantity = productSize.stockQuantity;
      }

      if (stockQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        productSizeId: item.productSizeId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const tax = Math.round(subtotal * 0.1);
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const [order] = await this.db
      .insert(Order)
      .values({
        orderNumber,
        buyerId: buyer.id,
        vendorId: body.vendorId,
        paymentMethod: body.paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        currencyId: products[0].currencyId,
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        notes: body.notes,
      })
      .returning();

    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await this.db.insert(OrderItem).values(orderItemsWithOrderId);

    return await this.getOrderById(order.id);
  }

  async getOrders(user: TUser, query: Dto.GetOrdersQuery, type: 'buyer' | 'vendor') {
    const { limit, offset } = getPage(query);
    const userFilter = type === 'buyer' ? eq(Order.buyerId, user.id) : eq(Order.vendorId, user.id);
    const statusFilter = query.status ? eq(Order.status, query.status as any) : undefined;
    const paymentStatusFilter = query.paymentStatus ? eq(Order.paymentStatus, query.paymentStatus as any) : undefined;

    const [stats] = await this.db
      .select({ count: count(Order.id) })
      .from(Order)
      .where(and(userFilter, statusFilter, paymentStatusFilter));

    const data = await this.db.query.Order.findMany({
      limit,
      offset,
      where: and(userFilter, statusFilter, paymentStatusFilter),
      orderBy: desc(Order.createdAt),
      with: {
        orderItems: {
          with: {
            product: true,
            productSize: { with: { size: true } },
          },
        },
        buyer: true,
        vendor: true,
        currency: true,
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getOrderById(orderId: number) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
      with: {
        orderItems: {
          with: {
            product: true,
            productSize: { with: { size: true } },
          },
        },
        buyer: true,
        vendor: true,
        currency: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(user: TUser, orderId: number, body: Dto.UpdateOrderStatusBody) {
    const order = await this.getOrderById(orderId);

    if (order.vendorId !== user.id && order.buyerId !== user.id) {
      throw new NotFoundException('Order not found');
    }

    const [updatedOrder] = await this.db
      .update(Order)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(Order.id, orderId))
      .returning();

    return updatedOrder;
  }

  async cancelOrder(user: TUser, orderId: number) {
    const order = await this.getOrderById(orderId);

    if (order.buyerId !== user.id) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Order cannot be cancelled');
    }

    const [updatedOrder] = await this.db
      .update(Order)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(Order.id, orderId))
      .returning();

    return updatedOrder;
  }
}
