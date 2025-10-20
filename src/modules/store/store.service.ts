import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { PaystackService } from '../paystack/paystack.service';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Store, TUser, Order, Product, OrderItem } from '../drizzle/schema';
import { eq, and, desc, count, or, ilike, gte, sum, lt } from 'drizzle-orm';

@Injectable()
export class StoreService {
  constructor(
    private readonly paystack: PaystackService,
    @Inject(DATABASE) private readonly db: TDatabase,
  ) {}

  async getStores(query: Dto.GetStoreQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const queryFilter = q ? or(ilike(Store.name, q), ilike(Store.description || '', q)) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Store.isOnline, !!query.isActive) : undefined;

    const [stats] = await this.db
      .select({ count: count(Store.id) })
      .from(Store)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.Store.findMany({
      limit,
      offset,
      with: { owner: true },
      orderBy: desc(Store.createdAt),
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getStoreById(storeId: number) {
    const store = await this.db.query.Store.findFirst({ where: eq(Store.id, storeId), with: { owner: true } });
    if (!store) throw new NotFoundException('store not found');
    return store;
  }

  async updateStore(storeId: number, user: TUser, body: Dto.UpdateStoreBody) {
    let store = await this.db.query.Store.findFirst({
      where: and(eq(Store.id, storeId), eq(Store.ownerId, user.id)),
    });

    if (!store) throw new NotFoundException('store not found');

    [store] = await this.db
      .update(Store)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(Store.id, storeId))
      .returning();

    if (store.subAccountCode) {
      await this.paystack.updateSubaccount(store.subAccountCode, {
        business_name: store.name,
        primary_contact_email: user.email,
        primary_contact_phone: user.phone,
        primary_contact_name: user.fullName,
        description: store.description || '',
        settlement_schedule: store.payoutSchedule || 'auto',
      });
    }

    return store;
  }

  async updateBank(storeId: number, user: TUser, body: Dto.UpdateBankBody) {
    const store = await this.db.query.Store.findFirst({
      where: and(eq(Store.id, storeId), eq(Store.ownerId, user.id)),
    });

    if (!store?.id) throw new NotFoundException('store not found');

    const resolved = await this.paystack.resolveAccountNumber({
      bank_code: '001',
      account_number: body.accountNumber,
    });

    // Sample object for resolved based on its type (TPaystackResolveAccountResponse)
    // const resolved = {
    //   account_number: '1234567890',
    //   account_name: 'John Doe',
    //   bank_id: 1,
    //   bank_code: body.bankCode,
    //   bank_name: body.bankName || 'Sample Bank',
    // };

    if (!store.subAccountCode) {
      const subaccount = await this.paystack.createSubaccount({
        percentage_charge: 0.0,
        bank_code: body.bankCode,
        business_name: store.name,
        primary_contact_email: user.email,
        primary_contact_phone: user.phone,
        primary_contact_name: user.fullName,
        description: store.description || '',
        account_number: resolved.account_number,
        settlement_schedule: body.payoutSchedule,
      });

      await this.db
        .update(Store)
        .set({
          bankName: body.bankName,
          accountName: resolved.account_name,
          payoutSchedule: body.payoutSchedule,
          accountNumber: resolved.account_number,
          subAccountCode: subaccount.subaccount_code,
        })
        .where(eq(Store.id, store.id));

      return {};
    }

    await this.paystack.updateSubaccount(store.subAccountCode, {
      bank_code: body.bankCode,
      account_number: resolved.account_number,
      settlement_schedule: body.payoutSchedule || 'auto',
    });

    return {};
  }

  async getDashboardStats(storeId: number) {
    const sevenDaysAgo = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [todayRow] = await this.db
      .select({ amount: sum(OrderItem.totalPrice).mapWith(Number) })
      .from(OrderItem)
      .innerJoin(Order, eq(OrderItem.orderId, Order.id))
      .where(
        and(eq(OrderItem.storeId, storeId), eq(Order.paymentStatus, 'paid'), gte(OrderItem.createdAt, startOfToday)),
      );

    const [weekRow] = await this.db
      .select({ amount: sum(OrderItem.totalPrice).mapWith(Number) })
      .from(OrderItem)
      .innerJoin(Order, eq(OrderItem.orderId, Order.id))
      .where(
        and(eq(OrderItem.storeId, storeId), eq(Order.paymentStatus, 'paid'), gte(OrderItem.createdAt, sevenDaysAgo)),
      );

    const [totalRow] = await this.db
      .select({ amount: sum(OrderItem.totalPrice).mapWith(Number) })
      .from(OrderItem)
      .innerJoin(Order, eq(OrderItem.orderId, Order.id))
      .where(and(eq(OrderItem.storeId, storeId), eq(Order.paymentStatus, 'paid')));

    const [returnsRow] = await this.db
      .select({ count: count(OrderItem.id) })
      .from(OrderItem)
      .where(and(eq(OrderItem.storeId, storeId), eq(OrderItem.status, 'refunded')));

    return {
      weeklyEarnings: Number(weekRow?.amount || 0),
      totalEarnings: Number(totalRow?.amount || 0),
      todaysEarnings: Number(todayRow?.amount || 0),
      customerReturns: Number(returnsRow?.count || 0),
    };
  }

  async getRecentActivities(storeId: number) {
    const items = await this.db
      .select({
        id: OrderItem.id,
        createdAt: OrderItem.createdAt,
        status: OrderItem.status,
        totalPrice: OrderItem.totalPrice,
      })
      .from(OrderItem)
      .where(eq(OrderItem.storeId, storeId))
      .orderBy(desc(OrderItem.createdAt))
      .limit(10);

    return items.map((it) => ({
      id: it.id,
      createdAt: it.createdAt,
      title: `Order item #${it.id} ${it.status}`,
      amount: it.totalPrice,
    }));
  }

  async getQuickStats(storeId: number) {
    const [activeProductsRow] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(and(eq(Product.storeId, storeId), eq(Product.isActive, true)));

    const [pendingOrdersRow] = await this.db
      .select({ count: count(OrderItem.id) })
      .from(OrderItem)
      .where(and(eq(OrderItem.storeId, storeId), eq(OrderItem.status, 'pending')));

    const LOW_STOCK_THRESHOLD = 5;
    const [lowStockRow] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(
        and(eq(Product.storeId, storeId), eq(Product.isActive, true), lt(Product.stockQuantity, LOW_STOCK_THRESHOLD)),
      );

    const [recyclingPointsRow] = await this.db
      .select({ count: count(OrderItem.id) })
      .from(OrderItem)
      .where(and(eq(OrderItem.storeId, storeId), eq(OrderItem.status, 'refunded')));

    return {
      activeProducts: Number(activeProductsRow?.count || 0),
      pendingOrders: Number(pendingOrdersRow?.count || 0),
      lowStockItems: Number(lowStockRow?.count || 0),
      recyclingPoints: Number(recyclingPointsRow?.count || 0),
    };
  }
}
