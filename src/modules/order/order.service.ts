import {
  Cart,
  Order,
  TUser,
  Product,
  CartItem,
  OrderItem,
  ProductSize,
  ShippingMethod,
  PaymentDetails,
} from '../drizzle/schema';
import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { eq, and, desc, count, countDistinct, ilike } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async HandleGetStoreOrderItems(user: TUser, query: Dto.GetOrderQuery) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const storeFilter = eq(OrderItem.storeId, storeId);
    const queryFilter = q ? ilike(OrderItem.orderId, q) : undefined;
    const statusFilter = query.status ? eq(OrderItem.status, query.status) : undefined;

    const [stats] = await this.db
      .select({ count: count(OrderItem.id) })
      .from(OrderItem)
      .where(and(storeFilter, statusFilter, queryFilter));

    const orderItems = await this.db.query.OrderItem.findMany({
      limit,
      offset,
      orderBy: desc(OrderItem.createdAt),
      where: and(storeFilter, statusFilter, queryFilter),
      with: {
        productSize: { with: { size: true } },
        product: { with: { brand: true, category: true, store: true } },
        order: { with: { buyer: true, currency: true, orderItems: true, paymentDetails: true, shippingMethod: true } },
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);

    return { data: orderItems, pagination };
  }

  async HandleGetStoreOrders(user: TUser, query: Dto.GetOrderQuery) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const queryFilter = q ? ilike(Order.orderNumber, q) : undefined;
    const statusFilter = query.status ? eq(Order.status, query.status) : undefined;

    const [stats] = await this.db
      .select({ count: countDistinct(Order.id) })
      .from(Order)
      .innerJoin(OrderItem, eq(Order.id, OrderItem.orderId))
      .where(and(statusFilter, queryFilter, eq(OrderItem.storeId, storeId)));

    const orders = await this.db.query.Order.findMany({
      limit,
      offset,
      orderBy: desc(Order.createdAt),
      where: and(statusFilter, queryFilter),
      with: {
        buyer: true,
        currency: true,
        paymentDetails: true,
        shippingMethod: true,
        orderItems: {
          where: eq(OrderItem.storeId, storeId),
          with: {
            productSize: { with: { size: true } },
            product: { with: { brand: true, category: true, store: true } },
          },
        },
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);

    return { data: orders, pagination };
  }

  async HandleGetStoreOrderItemById(id: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItem = await this.db.query.OrderItem.findFirst({
      where: and(eq(OrderItem.id, id), eq(OrderItem.storeId, storeId)),
      with: {
        productSize: { with: { size: true } },
        order: { with: { buyer: true, currency: true } },
        product: { with: { brand: true, category: true, store: true } },
      },
    });

    if (!orderItem?.id) throw new NotFoundException('order item not found');
    return orderItem;
  }

  async HandleGetStoreOrderById(id: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, id),
      with: {
        buyer: true,
        currency: true,
        orderItems: {
          where: eq(OrderItem.storeId, storeId),
          with: {
            productSize: { with: { size: true } },
            product: { with: { brand: true, category: true, store: true } },
          },
        },
      },
    });

    if (!order?.id) throw new NotFoundException('order not found');
    const isStoreOrder = order.orderItems.some((item) => item.product.store.id === storeId);
    if (!isStoreOrder) throw new NotFoundException('order not found');

    return order;
  }

  async HandleCheckout(user: TUser, body: Dto.CheckoutBody) {
    const cart = await this.db.query.Cart.findFirst({
      where: eq(Cart.userId, user.id),
      with: { items: { with: { product: { with: { currency: true, store: true } }, productSize: true } } },
    });

    if (!cart || cart.items.length === 0) throw new BadRequestException('cart is empty');

    const errors = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const productSize = item.productSize;

      if (!product || !product.isActive || product.deletedAt) {
        errors.push(`product "${product?.name || item?.productId}" is no longer available`);
        continue;
      }

      let price = product.price;
      let availableStock = product.stockQuantity;

      if (productSize) {
        if (productSize.deletedAt) {
          const error = `product size for "${product.name}" is no longer available`;
          errors.push(error);
          continue;
        }
        availableStock = productSize.stockQuantity;
        price = productSize.price;
      }

      if (availableStock < item.quantity) {
        const error = `insufficient stock for "${product.name}". available: ${availableStock}, requested: ${item.quantity}`;
        errors.push(error);
        continue;
      }

      validItems.push({
        ...item,
        validatedPrice: price,
        validatedProduct: product,
        validatedStock: availableStock,
        validatedProductSize: productSize,
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        data: errors,
        message: 'some items in your cart are no longer available',
      });
    }

    if (validItems.length === 0) throw new BadRequestException('no valid items found in cart');

    let subtotal = 0;
    const orderItems = [];
    const orderNumber = `ORD-${Date.now()}`;

    for (const item of validItems) {
      const price = item.validatedPrice;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        unitPrice: price,
        totalPrice: itemTotal,
        quantity: item.quantity,
        productId: item.productId,
        productSizeId: item.productSizeId,
        storeId: item.validatedProduct.storeId,
      });
    }

    let shippingCost = 0;
    const tax = Math.round(subtotal * 0.05);

    if (body.shippingMethodId) {
      const shippingMethod = await this.db.query.ShippingMethod.findFirst({
        where: eq(ShippingMethod.id, body.shippingMethodId),
      });

      if (shippingMethod) shippingCost = shippingMethod.price;
    }

    const total = subtotal + tax + shippingCost;

    const uniqueStores = [...new Set(validItems.map((item) => item.validatedProduct.storeId))];
    const isMultiVendor = uniqueStores.length > 1;

    const [order] = await this.db
      .insert(Order)
      .values({
        tax,
        total,
        subtotal,
        orderNumber,
        name: body.name,
        status: 'pending',
        buyerId: user.id,
        email: body.email,
        phone: body.phone,
        notes: body.notes,
        shipping: shippingCost,
        paymentStatus: 'pending',
        billingAddress: body.billingAddress,
        shippingAddress: body.shippingAddress,
        shippingMethodId: body.shippingMethodId,
        isMultiVendor,
        currencyId: validItems[0].validatedProduct.currencyId,
      })
      .returning();

    for (const item of orderItems) {
      await this.db.insert(OrderItem).values({
        orderId: order.id,
        ...item,
      });
    }

    await this.reduceStockForOrderItems(validItems);

    await this.db.delete(CartItem).where(eq(CartItem.cartId, cart.id));

    return {};
  }

  async HandleAcceptOrderItem(itemId: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItem = await this.db.query.OrderItem.findFirst({
      with: { order: true, product: { with: { store: true } } },
      where: and(eq(OrderItem.id, itemId), eq(OrderItem.storeId, storeId)),
    });

    if (!orderItem) throw new NotFoundException('order item not found');

    if (orderItem.status !== 'pending') {
      throw new BadRequestException('order item cannot be accepted in current status');
    }

    await this.db
      .update(OrderItem)
      .set({
        status: 'confirmed',
        updatedAt: new Date(),
        confirmedAt: new Date(),
      })
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.updateOrderStatusBasedOnItems(orderItem.order.id);

    return {};
  }

  async HandleAcceptOrder(orderId: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    let orderItems = await this.db.query.OrderItem.findMany({
      where: and(eq(OrderItem.orderId, orderId), eq(OrderItem.storeId, storeId)),
      with: {
        order: true,
        product: { with: { store: true } },
      },
    });

    if (orderItems.length === 0) throw new NotFoundException('no order items found for this store');

    orderItems = orderItems.filter((item) => item.status === 'pending');

    for (const item of orderItems) {
      await this.db
        .update(OrderItem)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(OrderItem.id, item.id));
    }

    await this.updateOrderStatusBasedOnItems(orderId);

    return {};
  }

  async HandleRejectOrderItem(itemId: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItem = await this.db.query.OrderItem.findFirst({
      where: and(eq(OrderItem.id, itemId), eq(OrderItem.storeId, storeId)),
    });

    if (!orderItem) throw new NotFoundException('order item not found');
    if (!['pending', 'confirmed'].includes(orderItem.status || '')) {
      throw new BadRequestException('order item cannot be cancelled in current status');
    }

    await this.db
      .update(OrderItem)
      .set({ status: 'cancelled', updatedAt: new Date(), cancelledAt: new Date() })
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.restoreStockForOrderItem(orderItem);
    await this.updateOrderStatusBasedOnItems(orderItem.orderId);

    return {};
  }

  async HandleRejectOrder(orderId: number, user: TUser) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    let orderItems = await this.db.query.OrderItem.findMany({
      where: and(eq(OrderItem.orderId, orderId), eq(OrderItem.storeId, storeId)),
    });

    if (orderItems.length === 0) throw new NotFoundException('no order items found for this store');

    orderItems = orderItems.filter((item) => item.status === 'pending');

    for (const item of orderItems) {
      await this.db
        .update(OrderItem)
        .set({ status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() })
        .where(eq(OrderItem.id, item.id));
    }

    await this.restoreStockForOrderItems(orderItems);
    await this.updateOrderStatusBasedOnItems(orderId);

    return {};
  }

  async HandleGetOrderById(orderId: number, user: TUser) {
    const order = await this.db.query.Order.findFirst({
      where: and(eq(Order.id, orderId), eq(Order.buyerId, user.id)),
      with: {
        buyer: true,
        currency: true,
        orderItems: {
          with: {
            productSize: { with: { size: true } },
            product: { with: { brand: true, category: true, store: true } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('order not found');
    return order;
  }

  async HandleGetMyOrders(user: TUser, query: Dto.GetOrderQuery) {
    const { limit, offset } = getPage(query);
    const buyerFilter = eq(Order.buyerId, user.id);
    const statusFilter = query.status ? eq(Order.status, query.status) : undefined;

    const [stats] = await this.db
      .select({ count: count(Order.id) })
      .from(Order)
      .where(and(buyerFilter, statusFilter));

    const orders = await this.db.query.Order.findMany({
      limit,
      offset,
      orderBy: desc(Order.createdAt),
      where: and(buyerFilter, statusFilter),
      with: {
        currency: true,
        orderItems: {
          with: {
            productSize: { with: { size: true } },
            product: { with: { brand: true, category: true, store: true } },
          },
        },
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data: orders, pagination };
  }
  //

  private async reduceStockForOrderItems(validItems: any[]) {
    for (const item of validItems) {
      if (item.productSizeId) {
        await this.db
          .update(ProductSize)
          .set({ updatedAt: new Date(), stockQuantity: item.validatedStock - item.quantity })
          .where(eq(ProductSize.id, item.productSizeId));
        return;
      }

      await this.db
        .update(Product)
        .set({ stockQuantity: item.validatedStock - item.quantity, updatedAt: new Date() })
        .where(eq(Product.id, item.productId));
    }
  }

  async createPaymentDetails(orderId: number, body: Dto.CreatePaymentDetailsBody) {
    const [paymentDetails] = await this.db
      .insert(PaymentDetails)
      .values({
        orderId,
        paymentProvider: body.paymentProvider,
        paymentMethod: body.paymentMethod,
        amount: body.amount,
        currencyId: 1, // Assuming NGN currency ID
        status: body.status || 'pending',
        externalTransactionId: body.externalTransactionId,
        externalReference: body.externalReference,
        fees: body.fees || 0,
        netAmount: body.netAmount,
        isEscrow: body.isEscrow || false,
      })
      .returning();

    return paymentDetails;
  }

  async updatePaymentStatus(paymentDetailsId: number, status: string, gatewayResponse?: any) {
    const [updatedPayment] = await this.db
      .update(PaymentDetails)
      .set({
        status: status as any,
        gatewayResponse,
        updatedAt: new Date(),
      })
      .where(eq(PaymentDetails.id, paymentDetailsId))
      .returning();

    return updatedPayment;
  }

  async releaseEscrow(paymentDetailsId: number) {
    const [updatedPayment] = await this.db
      .update(PaymentDetails)
      .set({
        escrowReleasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(PaymentDetails.id, paymentDetailsId))
      .returning();

    return updatedPayment;
  }

  async updateOrderStatus(orderId: number, body: Dto.UpdateOrderStatusBody) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updateData: any = {
      status: body.status,
      updatedAt: new Date(),
    };

    // Set appropriate timestamp based on status
    switch (body.status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'processing':
        updateData.processingAt = new Date();
        break;
      case 'shipped':
        updateData.dispatchedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
      case 'refunded':
        updateData.refundedAt = new Date();
        break;
    }

    const [updatedOrder] = await this.db.update(Order).set(updateData).where(eq(Order.id, orderId)).returning();

    return updatedOrder;
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
      with: {
        orderItems: {
          with: {
            product: { with: { store: true } },
            productSize: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isBuyer = order.buyerId === userId;
    const isStoreOwner = order.orderItems.some((item) => item.product.store.ownerId === userId);

    if (!isBuyer && !isStoreOwner) {
      throw new Error('Unauthorized to cancel this order');
    }

    const [updatedOrder] = await this.db
      .update(Order)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(Order.id, orderId))
      .returning();

    await this.restoreStockForOrderItems(order.orderItems);

    return updatedOrder;
  }

  private async restoreStockForOrderItems(orderItems: any[]) {
    for (const item of orderItems) {
      if (item.productSizeId) {
        await this.db
          .update(ProductSize)
          .set({
            stockQuantity: item.productSize.stockQuantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(ProductSize.id, item.productSizeId));
      } else {
        await this.db
          .update(Product)
          .set({
            stockQuantity: item.product.stockQuantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(Product.id, item.productId));
      }
    }
  }

  async dispatchOrder(orderId: number, user: TUser, _body: Dto.DispatchOrderBody) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItems = await this.db.query.OrderItem.findMany({
      where: eq(OrderItem.orderId, orderId),
      with: {
        order: true,
        product: { with: { store: true } },
      },
    });

    const storeOrderItems = orderItems.filter((item) => item.product.store.id === storeId);

    if (storeOrderItems.length === 0) throw new NotFoundException('no order items found for this store');

    for (const item of storeOrderItems) {
      if (!['confirmed', 'processing'].includes(item.status || '')) {
        throw new BadRequestException(`order item ${item.id} cannot be dispatched in current status`);
      }
    }

    for (const item of storeOrderItems) {
      await this.db
        .update(OrderItem)
        .set({
          status: 'shipped',
          shippedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(OrderItem.id, item.id));
    }

    await this.updateOrderStatusBasedOnItems(orderId);

    return { message: 'Order items dispatched successfully' };
  }

  async markAsDelivered(orderId: number, user: TUser, _body: Dto.MarkDeliveredBody) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItems = await this.db.query.OrderItem.findMany({
      where: eq(OrderItem.orderId, orderId),
      with: {
        order: true,
        product: { with: { store: true } },
      },
    });

    const storeOrderItems = orderItems.filter((item) => item.product.store.id === storeId);

    if (storeOrderItems.length === 0) throw new NotFoundException('no order items found for this store');

    for (const item of storeOrderItems) {
      if (item.status !== 'shipped') {
        throw new BadRequestException(`order item ${item.id} must be shipped before marking as delivered`);
      }
    }

    for (const item of storeOrderItems) {
      await this.db
        .update(OrderItem)
        .set({
          status: 'delivered',
          deliveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(OrderItem.id, item.id));
    }

    await this.updateOrderStatusBasedOnItems(orderId);

    return { message: 'Order items marked as delivered successfully' };
  }

  async getOrderTimeline(orderId: number) {
    const order = await this.db.query.Order.findFirst({
      where: eq(Order.id, orderId),
      with: {
        paymentDetails: true,
        shippingMethod: true,
        currency: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const timeline = [];

    // Order created
    timeline.push({
      status: 'Order Created',
      timestamp: order.createdAt,
      description: `Order ${order.orderNumber} was created`,
    });

    // Order confirmed
    if (order.confirmedAt) {
      timeline.push({
        status: 'Order Confirmed',
        timestamp: order.confirmedAt,
        description: 'Vendor accepted the order',
      });
    }

    // Order processing
    if (order.processingAt) {
      timeline.push({
        status: 'Processing',
        timestamp: order.processingAt,
        description: 'Order is being prepared',
      });
    }

    // Order dispatched
    if (order.dispatchedAt) {
      timeline.push({
        status: 'Dispatched',
        timestamp: order.dispatchedAt,
        description: 'Order has been shipped',
      });
    }

    // Order delivered
    if (order.deliveredAt) {
      timeline.push({
        status: 'Delivered',
        timestamp: order.deliveredAt,
        description: 'Order has been delivered',
      });
    }

    // Order cancelled
    if (order.cancelledAt) {
      timeline.push({
        status: 'Cancelled',
        timestamp: order.cancelledAt,
        description: 'Order was cancelled',
      });
    }

    // Order refunded
    if (order.refundedAt) {
      timeline.push({
        status: 'Refunded',
        timestamp: order.refundedAt,
        description: 'Order was refunded',
      });
    }

    return {
      order,
      timeline: timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    };
  }

  async getOrderAnalytics(storeId?: number, startDate?: Date, endDate?: Date) {
    const conditions = [];

    if (startDate && endDate) {
      conditions.push(and(eq(Order.createdAt, startDate), eq(Order.createdAt, endDate)));
    }

    const orders = await this.db.query.Order.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        paymentDetails: true,
        currency: true,
        orderItems: {
          with: {
            product: { with: { store: true } },
          },
        },
      },
    });

    const filteredOrders = storeId
      ? orders.filter((order) => order.orderItems.some((item) => item.product.store.id === storeId))
      : orders;

    let vendorRevenue = 0;
    let vendorItemCount = 0;
    const vendorStatusBreakdown = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    if (storeId) {
      filteredOrders.forEach((order) => {
        const vendorItems = order.orderItems.filter((item) => item.product.store.id === storeId);
        vendorItems.forEach((item) => {
          vendorRevenue += item.totalPrice;
          vendorItemCount++;
          const status = item.status || 'pending';
          if (vendorStatusBreakdown[status] !== undefined) {
            vendorStatusBreakdown[status]++;
          }
        });
      });
    }

    const analytics = {
      totalOrders: filteredOrders.length,
      totalRevenue: storeId ? vendorRevenue : filteredOrders.reduce((sum, order) => sum + order.total, 0),
      totalFees: filteredOrders.reduce(
        (sum, order) => sum + (order.paymentDetails?.reduce((feeSum, payment) => feeSum + (payment.fees || 0), 0) || 0),
        0,
      ),
      netRevenue: 0,
      statusBreakdown: storeId
        ? vendorStatusBreakdown
        : {
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            refunded: 0,
          },
      averageOrderValue: 0,
      completionRate: 0,
      vendorMetrics: storeId
        ? {
            totalItems: vendorItemCount,
            averageItemValue: vendorItemCount > 0 ? vendorRevenue / vendorItemCount : 0,
          }
        : undefined,
    };

    if (!storeId) {
      filteredOrders.forEach((order) => {
        if (order.status) {
          analytics.statusBreakdown[order.status]++;
        }
      });
    }

    analytics.netRevenue = analytics.totalRevenue - analytics.totalFees;
    analytics.averageOrderValue = analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0;
    const completedOrders = analytics.statusBreakdown.delivered;
    analytics.completionRate = analytics.totalOrders > 0 ? (completedOrders / analytics.totalOrders) * 100 : 0;

    return analytics;
  }

  async updateOrderItemStatus(itemId: number, user: TUser, body: Dto.UpdateOrderItemStatusBody) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const orderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: {
        order: true,
        product: { with: { store: true } },
      },
    });

    if (!orderItem) throw new NotFoundException('order item not found');
    if (orderItem.product.store.id !== storeId) {
      throw new BadRequestException('order item does not belong to this store');
    }

    const updateData: any = {
      status: body.status,
      updatedAt: new Date(),
    };

    switch (body.status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'processing':
        updateData.processingAt = new Date();
        break;
      case 'shipped':
        updateData.shippedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
      case 'refunded':
        updateData.refundedAt = new Date();
        break;
    }

    const [updatedOrderItem] = await this.db
      .update(OrderItem)
      .set(updateData)
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.updateOrderStatusBasedOnItems(orderItem.order.id);

    return updatedOrderItem;
  }

  private async updateOrderStatusBasedOnItems(orderId: number) {
    const orderItems = await this.db.query.OrderItem.findMany({
      where: eq(OrderItem.orderId, orderId),
    });

    if (orderItems.length === 0) return;

    const statusCounts = orderItems.reduce(
      (acc, item) => {
        const status = item.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    let overallStatus: string;

    if (statusCounts.cancelled === orderItems.length) {
      overallStatus = 'cancelled';
    } else if (statusCounts.delivered === orderItems.length) {
      overallStatus = 'delivered';
    } else if (statusCounts.shipped && statusCounts.shipped + (statusCounts.delivered || 0) === orderItems.length) {
      overallStatus = 'shipped';
    } else if (
      statusCounts.processing &&
      statusCounts.processing + (statusCounts.shipped || 0) + (statusCounts.delivered || 0) === orderItems.length
    ) {
      overallStatus = 'processing';
    } else if (
      statusCounts.confirmed &&
      statusCounts.confirmed +
        (statusCounts.processing || 0) +
        (statusCounts.shipped || 0) +
        (statusCounts.delivered || 0) ===
        orderItems.length
    ) {
      overallStatus = 'confirmed';
    } else {
      overallStatus = 'pending';
    }

    const updateData: any = {
      status: overallStatus,
      updatedAt: new Date(),
    };

    switch (overallStatus) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'processing':
        updateData.processingAt = new Date();
        break;
      case 'shipped':
        updateData.dispatchedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
    }

    await this.db.update(Order).set(updateData).where(eq(Order.id, orderId));
  }

  private async restoreStockForOrderItem(orderItem: any) {
    if (orderItem.productSizeId) {
      await this.db
        .update(ProductSize)
        .set({
          stockQuantity: orderItem.productSize.stockQuantity + orderItem.quantity,
          updatedAt: new Date(),
        })
        .where(eq(ProductSize.id, orderItem.productSizeId));
    } else {
      await this.db
        .update(Product)
        .set({
          stockQuantity: orderItem.product.stockQuantity + orderItem.quantity,
          updatedAt: new Date(),
        })
        .where(eq(Product.id, orderItem.productId));
    }
  }
}
