import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { Store } from '../drizzle/schema';
import { eq, and, desc, count, or, ilike } from 'drizzle-orm';
import * as Dto from './dto';

@Injectable()
export class StoreService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async createStore(ownerId: number, body: Dto.CreateStoreBody) {
    const existingStore = await this.db.query.Store.findFirst({
      where: eq(Store.ownerId, ownerId),
    });

    if (existingStore) {
      throw new Error('User already has a store');
    }

    const [store] = await this.db
      .insert(Store)
      .values({ ...body, ownerId })
      .returning();

    return store;
  }

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
      orderBy: desc(Store.createdAt),
      with: { owner: true },
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getStoreById(storeId: number) {
    const store = await this.db.query.Store.findFirst({
      where: eq(Store.id, storeId),
      with: { owner: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async getStoreByOwnerId(ownerId: number) {
    const store = await this.db.query.Store.findFirst({
      where: eq(Store.ownerId, ownerId),
      with: { owner: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async updateStore(storeId: number, body: Dto.UpdateStoreBody) {
    const [store] = await this.db
      .update(Store)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(Store.id, storeId))
      .returning();

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async toggleStoreOnline(storeId: number) {
    const store = await this.db.query.Store.findFirst({
      where: eq(Store.id, storeId),
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const [updatedStore] = await this.db
      .update(Store)
      .set({ isOnline: !store.isOnline, updatedAt: new Date() })
      .where(eq(Store.id, storeId))
      .returning();

    return updatedStore;
  }

  async deleteStore(storeId: number) {
    const store = await this.db.query.Store.findFirst({
      where: eq(Store.id, storeId),
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.db.delete(Store).where(eq(Store.id, storeId));
    return { success: true };
  }
}
