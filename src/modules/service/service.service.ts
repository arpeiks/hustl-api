import * as Dto from './dto';
import { TDatabase } from '@/types';
import { DATABASE } from '@/consts';
import { Service } from '../drizzle/schema';
import { eq, desc, or, count } from 'drizzle-orm';
import { generatePagination, getPage } from '@/utils';
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class ServiceService {
  constructor(@Inject(DATABASE) private readonly provider: TDatabase) {}

  async createService(body: Dto.CreateServiceBody) {
    const existingService = await this.provider.query.Service.findFirst({
      columns: { id: true },
      where: eq(Service.name, body.name),
    });

    if (existingService) throw new ConflictException('Service already exists');

    const [service] = await this.provider
      .insert(Service)
      .values({ name: body.name, description: body.description })
      .returning();

    return service;
  }

  async updateService(id: number, body: Dto.UpdateServiceBody) {
    const existingService = await this.provider.query.Service.findFirst({
      columns: { id: true },
      where: eq(Service.id, id),
    });

    if (!existingService) throw new NotFoundException('Service not found');

    const [service] = await this.provider
      .update(Service)
      .set({ name: body.name, updatedAt: new Date(), description: body.description })
      .where(eq(Service.id, id))
      .returning();

    return service;
  }

  async deleteService(id: number) {
    const existingService = await this.provider.query.Service.findFirst({
      columns: { id: true },
      where: eq(Service.id, id),
    });

    if (!existingService) throw new NotFoundException('Service not found');

    await this.provider.delete(Service).where(eq(Service.id, id));

    return {};
  }

  async getServices(query: Dto.GetServicesQuery) {
    const q = `%${query.q}%`;
    const { limit, offset } = getPage(query);
    const qFilter = query.q ? or(eq(Service.name, q), eq(Service.description, q)) : undefined;

    const [stats] = await this.provider
      .select({ count: count(Service.id) })
      .from(Service)
      .where(qFilter);

    const data = await this.provider.query.Service.findMany({
      limit,
      offset,
      where: qFilter,
      orderBy: [desc(Service.updatedAt)],
    });

    const total = stats.count;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getServiceById(id: number) {
    const data = await this.provider.query.Service.findFirst({ where: eq(Service.id, id) });
    if (!data) throw new NotFoundException('Service not found');
    return data;
  }
}
