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
import { ProductService } from '@/modules/product/product.service';
import { PaystackService } from '@/modules/paystack/paystack.service';
import { eq, and, desc, count, countDistinct, ilike } from 'drizzle-orm';
import { NotificationService } from '@/modules/notification/notification.service';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(
    private readonly paystack: PaystackService,
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly productService: ProductService,
    private readonly notificationService: NotificationService,
  ) {}

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
    const tax = Math.round(subtotal * 0.0);

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
        isMultiVendor,
        name: body.name,
        status: 'pending',
        buyerId: user.id,
        email: body.email,
        phone: body.phone,
        shipping: shippingCost,
        paymentStatus: 'pending',
        shippingAddress: body.shippingAddress,
        shippingMethodId: body.shippingMethodId,
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

    for (const item of validItems) {
      await this.productService.checkLowStockAlert(item.productId);
    }

    const storeTotals = new Map<number, number>();
    for (const item of orderItems) {
      const prev = storeTotals.get(item.storeId) || 0;
      storeTotals.set(item.storeId, prev + item.totalPrice);
    }

    const storeIdToSub = new Map<number, string>();
    for (const item of validItems) {
      const store = item.validatedProduct.store;
      if (store?.subAccountCode) storeIdToSub.set(store.id, store.subAccountCode);
    }

    const amountInKobo = total;

    const initBody: any = {
      email: body.email,
      amount: amountInKobo,
      currency: 'NGN',
      reference: order.orderNumber,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    };

    if (uniqueStores.length === 1) {
      const singleStoreId = uniqueStores[0];
      const directSub = storeIdToSub.get(singleStoreId);
      if (directSub) initBody.subaccount = directSub;
    } else {
      const flatSubaccounts = Array.from(storeTotals.entries())
        .map(([storeId, amount]) => {
          const sub = storeIdToSub.get(storeId);
          if (!sub) return null;
          const share = amount;
          return { subaccount: sub, share };
        })
        .filter(Boolean) as Array<{ subaccount: string; share: number }>;

      if (flatSubaccounts.length) {
        initBody.split = {
          type: 'flat' as const,
          currency: 'NGN',
          subaccounts: flatSubaccounts,
          bearer_type: 'account' as const,
        };
      }
    }

    const init = await this.paystack.initializeTransaction(initBody);

    await this.db.insert(PaymentDetails).values({
      amount: total,
      isEscrow: true,
      netAmount: total,
      orderId: order.id,
      status: 'pending',
      paymentMethod: 'card',
      gatewayResponse: init,
      paymentProvider: 'paystack',
      currencyId: order.currencyId,
      externalReference: init.data.reference,
    });

    await this.db.delete(CartItem).where(eq(CartItem.cartId, cart.id));

    await this.db
      .update(Order)
      .set({ authorizationReference: init.data.reference, authorizationUrl: init.data.authorization_url })
      .where(eq(Order.id, order.id));

    const orderWithItems = await this.db.query.Order.findFirst({
      with: { orderItems: true },
      where: eq(Order.id, order.id),
    });

    if (orderWithItems) {
      await this.notificationService.notifyOrderPlaced(orderWithItems);
    }

    return { authorizationUrl: init.data.authorization_url, reference: init.data.reference };
  }

  async HandleDispatchOrderItem(itemId: number, user: TUser) {
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

    const oldStatus = orderItem.status;
    await this.db
      .update(OrderItem)
      .set({ status: 'shipped', updatedAt: new Date(), shippedAt: new Date() })
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.updateOrderStatusBasedOnItems(orderItem.order.id);

    const updatedOrderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: { order: true, product: true },
    });

    if (updatedOrderItem) {
      await this.notificationService.notifyOrderItemStatusChange(updatedOrderItem, oldStatus, 'shipped');
    }

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

    const oldStatus = orderItem.status;
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

    const updatedOrderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: { order: true, product: true },
    });

    if (updatedOrderItem) {
      await this.notificationService.notifyOrderItemStatusChange(updatedOrderItem, oldStatus, 'confirmed');
    }

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

  async HandleDispatchOrder(orderId: number, user: TUser) {
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

    for (const item of orderItems) {
      await this.db
        .update(OrderItem)
        .set({
          status: 'shipped',
          shippedAt: new Date(),
          confirmedAt: new Date(),
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

    const oldStatus = orderItem.status;
    await this.db
      .update(OrderItem)
      .set({ status: 'cancelled', updatedAt: new Date(), cancelledAt: new Date() })
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.restoreStockForOrderItem(orderItem);
    await this.updateOrderStatusBasedOnItems(orderItem.orderId);

    const updatedOrderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: { order: true, product: true },
    });

    if (updatedOrderItem) {
      await this.notificationService.notifyOrderItemStatusChange(updatedOrderItem, oldStatus || 'pending', 'cancelled');
    }

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

  async HandleMarkItemDelivered(itemId: number, user: TUser) {
    const orderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: { order: true, product: { with: { store: true } } },
    });

    if (!orderItem) throw new NotFoundException('order item not found');

    if (orderItem.order.buyerId !== user.id) {
      throw new NotFoundException('order item not found or you are not the buyer');
    }

    if (orderItem.status !== 'shipped') {
      throw new BadRequestException('order item must be shipped before it can be marked as delivered');
    }

    const oldStatus = orderItem.status;
    await this.db
      .update(OrderItem)
      .set({ status: 'delivered', updatedAt: new Date(), deliveredAt: new Date() })
      .where(eq(OrderItem.id, itemId))
      .returning();

    await this.updateOrderStatusBasedOnItems(orderItem.order.id);

    const updatedOrderItem = await this.db.query.OrderItem.findFirst({
      where: eq(OrderItem.id, itemId),
      with: { order: true, product: true },
    });

    if (updatedOrderItem) {
      await this.notificationService.notifyOrderItemStatusChange(updatedOrderItem, oldStatus, 'delivered');
    }

    return {};
  }

  async HandleMarkOrderDelivered(orderId: number, user: TUser) {
    const order = await this.db.query.Order.findFirst({
      with: { orderItems: true },
      where: and(eq(Order.id, orderId), eq(Order.buyerId, user.id)),
    });

    if (!order) throw new NotFoundException('order not found or you are not the buyer');

    let orderItems = order.orderItems;

    if (orderItems.length === 0) throw new NotFoundException('no order items found for this order');

    orderItems = orderItems.filter((item) => item.status === 'shipped');

    if (orderItems.length === 0) throw new BadRequestException('no shipped items found to mark as delivered');

    for (const item of orderItems) {
      await this.db
        .update(OrderItem)
        .set({ status: 'delivered', updatedAt: new Date(), deliveredAt: new Date() })
        .where(eq(OrderItem.id, item.id));
    }

    await this.updateOrderStatusBasedOnItems(orderId);

    return {};
  }
}
