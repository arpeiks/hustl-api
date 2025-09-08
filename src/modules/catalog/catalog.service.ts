import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { Brand, Category, Size } from '../drizzle/schema';
import { eq, and, desc, count, or, ne, ilike } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class CatalogService {
  constructor(
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createBrand(body: Dto.CreateBrandBody, file?: Express.Multer.File) {
    const existingBrand = await this.db.query.Brand.findFirst({ where: eq(Brand.name, body.name) });
    if (existingBrand) return existingBrand;

    let logoUrl: string | undefined;
    if (file) logoUrl = await this.cloudinaryService.upload(file, 'brand-logos');

    const [brand] = await this.db
      .insert(Brand)
      .values({ ...body, logo: logoUrl })
      .returning();

    return brand;
  }

  async getBrands(query: Dto.GetCatalogQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const queryFilter = q ? ilike(Brand.name, q) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Brand.isActive, !!query.isActive) : undefined;

    const [stats] = await this.db
      .select({ count: count(Brand.id) })
      .from(Brand)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.Brand.findMany({
      limit,
      offset,
      orderBy: desc(Brand.createdAt),
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getBrandById(brandId: number) {
    const brand = await this.db.query.Brand.findFirst({ where: eq(Brand.id, brandId) });
    if (!brand) throw new NotFoundException('brand not found');

    return brand;
  }

  async updateBrand(brandId: number, body: Dto.UpdateBrandBody, file?: Express.Multer.File) {
    if (body.name) {
      const existingBrand = await this.db.query.Brand.findFirst({
        where: and(eq(Brand.name, body.name), ne(Brand.id, brandId)),
      });
      if (existingBrand) return existingBrand;
    }

    let logoUrl: string | undefined;
    if (file) logoUrl = await this.cloudinaryService.upload(file, 'brand-logos');

    const [brand] = await this.db
      .update(Brand)
      .set({ ...body, logo: logoUrl, updatedAt: new Date() })
      .where(eq(Brand.id, brandId))
      .returning();

    if (!brand) throw new NotFoundException('brand not found');

    return brand;
  }

  async deleteBrand(brandId: number) {
    const brand = await this.db.query.Brand.findFirst({
      where: eq(Brand.id, brandId),
    });

    if (!brand) throw new NotFoundException('brand not found');
    await this.db.delete(Brand).where(eq(Brand.id, brandId));
    return {};
  }

  async createCategory(body: Dto.CreateCategoryBody) {
    const existingCategory = await this.db.query.Category.findFirst({ where: eq(Category.name, body.name) });
    if (existingCategory) return existingCategory;

    if (body.parentId) {
      const parentCategory = await this.db.query.Category.findFirst({ where: eq(Category.id, body.parentId) });
      if (!parentCategory?.id) throw new NotFoundException('parent category not found');
    }

    const [category] = await this.db
      .insert(Category)
      .values({ ...body, parentId: body.parentId })
      .returning();

    return category;
  }

  async getCategories(query: Dto.GetCatalogQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const queryFilter = q ? or(ilike(Category.name, q), ilike(Category.description || '', q)) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Category.isActive, !!query.isActive) : undefined;

    const [stats] = await this.db
      .select({ count: count(Category.id) })
      .from(Category)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.Category.findMany({
      limit,
      offset,
      with: { parent: true },
      orderBy: desc(Category.createdAt),
      where: and(activeFilter, queryFilter),
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getCategoryById(categoryId: number) {
    const category = await this.db.query.Category.findFirst({
      with: { parent: true },
      where: eq(Category.id, categoryId),
    });
    if (!category) throw new NotFoundException('category not found');
    return category;
  }

  async updateCategory(categoryId: number, body: Dto.UpdateCategoryBody) {
    if (body.name) {
      const existingCategory = await this.db.query.Category.findFirst({
        with: { parent: true },
        where: and(eq(Category.name, body.name), ne(Category.id, categoryId)),
      });
      if (existingCategory) return existingCategory;
    }

    const [category] = await this.db
      .update(Category)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(Category.id, categoryId))
      .returning();

    if (!category) throw new NotFoundException('category not found');

    return category;
  }

  async deleteCategory(categoryId: number) {
    const category = await this.db.query.Category.findFirst({
      where: eq(Category.id, categoryId),
    });

    if (!category) throw new NotFoundException('Category not found');

    await this.db.delete(Category).where(eq(Category.id, categoryId));
    return {};
  }

  async createSize(body: Dto.CreateSizeBody) {
    const existingSize = await this.db.query.Size.findFirst({
      where: and(eq(Size.name, body.name), eq(Size.value, body.value)),
    });
    if (existingSize) return existingSize;

    if (body.categoryId) {
      const category = await this.db.query.Category.findFirst({ where: eq(Category.id, body.categoryId) });
      if (!category) throw new NotFoundException('category not found');
    }

    const [size] = await this.db.insert(Size).values(body).returning();
    return size;
  }

  async getSizes(query: Dto.GetCatalogQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Size.isActive, !!query.isActive) : undefined;
    const queryFilter = q ? or(ilike(Size.name, q), ilike(Size.value, q)) : undefined;

    const [stats] = await this.db
      .select({ count: count(Size.id) })
      .from(Size)
      .where(and(activeFilter, queryFilter));

    const data = await this.db.query.Size.findMany({
      limit,
      offset,
      where: and(activeFilter, queryFilter),
      orderBy: desc(Size.createdAt),
      with: {
        category: true,
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getSizeById(sizeId: number) {
    const size = await this.db.query.Size.findFirst({ where: eq(Size.id, sizeId), with: { category: true } });
    if (!size) throw new NotFoundException('size not found');
    return size;
  }

  async updateSize(sizeId: number, body: Dto.UpdateSizeBody) {
    const existingSize = await this.db.query.Size.findFirst({
      where: and(
        eq(Size.name, body.name || ''),
        eq(Size.value, body.value || ''),
        eq(Size.categoryId, body.categoryId || 0),
      ),
    });
    if (existingSize) return existingSize;

    const [size] = await this.db
      .update(Size)
      .set({ ...body, updatedAt: new Date(), isActive: !!body.isActive })
      .where(eq(Size.id, sizeId))
      .returning();

    if (!size) throw new NotFoundException('size not found');

    return size;
  }

  async deleteSize(sizeId: number) {
    const size = await this.db.query.Size.findFirst({ where: eq(Size.id, sizeId) });
    if (!size) throw new NotFoundException('size not found');

    await this.db.delete(Size).where(eq(Size.id, sizeId));
    return {};
  }
}
