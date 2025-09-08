import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { Store, TUser } from '../drizzle/schema';
import { generatePagination, getPage } from '@/utils';
import { eq, and, desc, count, or, ilike } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class StoreService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async createStore(user: TUser, body: Dto.CreateStoreBody) {
    const ownerId = user.id;
    const existingStore = await this.db.query.Store.findFirst({ where: eq(Store.ownerId, ownerId) });

    if (existingStore) {
      const [updatedStore] = await this.db
        .update(Store)
        .set({ ...body, deletedAt: null, updatedAt: new Date() })
        .where(eq(Store.id, existingStore.id))
        .returning();

      return updatedStore;
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

  async updateStore(storeId: number, body: Dto.UpdateStoreBody) {
    const [store] = await this.db
      .update(Store)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(Store.id, storeId))
      .returning();

    if (!store) throw new NotFoundException('store not found');

    return store;
  }
}
