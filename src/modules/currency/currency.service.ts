import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { Currency } from '../drizzle/schema';
import { generatePagination, getPage } from '@/utils';
import { eq, and, or, desc, ilike, count, ne } from 'drizzle-orm';
import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  constructor(@Inject(DATABASE) private readonly db: TDatabase) {}

  async HandleCreateCurrency(body: Dto.CreateCurrencyBody) {
    const existingCurrency = await this.db.query.Currency.findFirst({
      columns: { id: true },
      where: or(eq(Currency.name, body.name), eq(Currency.code, body.code)),
    });

    if (existingCurrency?.id) throw new ConflictException('currency with this name or code already exists');

    await this.db
      .insert(Currency)
      .values({
        name: body.name,
        code: body.code,
        logo: body.logo,
        symbol: body.symbol,
        country: body.country,
        description: body.description,
        isActive: body.isActive !== undefined ? body.isActive : true,
      })
      .returning();

    return {};
  }

  async HandleUpdateCurrency(id: number, body: Dto.UpdateCurrencyBody) {
    const existingCurrency = await this.db.query.Currency.findFirst({
      columns: { id: true },
      where: eq(Currency.id, id),
    });

    if (!existingCurrency?.id) throw new NotFoundException('currency not found');

    const currency = await this.db.query.Currency.findFirst({
      columns: { id: true },
      where: and(or(eq(Currency.name, body.name), eq(Currency.code, body.code)), ne(Currency.id, id)),
    });

    if (currency?.id) throw new ConflictException('currency with this name or code already exists');

    await this.db
      .update(Currency)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(Currency.id, id))
      .returning();

    return {};
  }

  async HandleDeleteCurrency(id: number) {
    const existingCurrency = await this.db.query.Currency.findFirst({
      columns: { id: true },
      where: eq(Currency.id, id),
    });

    if (!existingCurrency?.id) throw new NotFoundException('currency not found');

    await this.db.delete(Currency).where(eq(Currency.id, id));
    return {};
  }

  async HandleGetCurrencies(query: Dto.GetCurrenciesQuery) {
    const q = `%${query?.q}%`;
    const { limit, offset } = getPage(query);
    const activeFilter = query?.isActive !== undefined ? eq(Currency.isActive, !!query.isActive) : undefined;

    const queryFilter = query?.q
      ? or(ilike(Currency.name, q), ilike(Currency.code, q), ilike(Currency.country || '', q))
      : undefined;

    const [stats] = await this.db
      .select({ count: count(Currency.id) })
      .from(Currency)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.Currency.findMany({
      limit,
      offset,
      orderBy: desc(Currency.createdAt),
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async HandleGetCurrencyById(id: number) {
    const currency = await this.db.query.Currency.findFirst({ where: eq(Currency.id, id) });

    if (!currency) throw new NotFoundException('currency not found');
    return currency;
  }
}
