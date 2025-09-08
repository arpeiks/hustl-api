import {
  Size,
  TUser,
  Brand,
  Order,
  Product,
  Category,
  Currency,
  OrderItem,
  ProductSize,
  ProductReview,
} from '../drizzle/schema';
import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { eq, and, desc, count, or, ilike, isNull } from 'drizzle-orm';
import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(user: TUser, body: Dto.CreateProductBody, files?: Express.Multer.File[]) {
    const storeId = user.store?.id;
    let images: string[] | undefined;
    if (!storeId) throw new NotFoundException('store not found');

    const sku = this.generateSKU(storeId, body.name);

    if (body.brandId) {
      const brand = await this.db.query.Brand.findFirst({ where: eq(Brand.id, body.brandId) });
      if (!brand) throw new NotFoundException('brand not found');
      body.brandId = brand.id;
    }

    if (body.categoryId) {
      const category = await this.db.query.Category.findFirst({ where: eq(Category.id, body.categoryId) });
      if (!category) throw new NotFoundException('category not found');
      body.categoryId = category.id;
    }

    if (body.currencyId) {
      const currency = await this.db.query.Currency.findFirst({ where: eq(Currency.id, body.currencyId) });
      if (!currency) throw new NotFoundException('currency not found');
      body.currencyId = currency.id;
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => this.cloudinaryService.upload(file, 'product-images'));
      const imageUrls = await Promise.all(uploadPromises);
      images = imageUrls.filter((url) => url !== null) as string[];
    }

    const stockQuantity = body?.stockQuantity || 1;
    const [product] = await this.db
      .insert(Product)
      .values({ ...body, isFeatured: !!body.isFeatured, stockQuantity, sku, storeId, images })
      .returning();

    return await this.getProductById(product.id);
  }

  async getProducts(query: Dto.GetProductsQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const notDeletedFilter = isNull(Product.deletedAt);
    const brandFilter = query.brandId ? eq(Product.brandId, query.brandId) : undefined;
    const storeFilter = query.storeId ? eq(Product.storeId, query.storeId) : undefined;
    const categoryFilter = query.categoryId ? eq(Product.categoryId, query.categoryId) : undefined;
    const queryFilter = q ? or(ilike(Product.name, q), ilike(Product.description || '', q)) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Product.isActive, !!query.isActive) : undefined;
    const featuredFilter = query.isFeatured !== undefined ? eq(Product.isFeatured, !!query.isFeatured) : undefined;

    const [stats] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(
        and(categoryFilter, brandFilter, storeFilter, featuredFilter, activeFilter, queryFilter, notDeletedFilter),
      );

    const data = await this.db.query.Product.findMany({
      limit,
      offset,
      orderBy: desc(Product.createdAt),
      where: and(categoryFilter, brandFilter, storeFilter, featuredFilter, activeFilter, queryFilter, notDeletedFilter),
      with: {
        brand: true,
        store: true,
        category: true,
        currency: true,
        productReviews: true,
        productSizes: { with: { size: true } },
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getProductById(productId: number) {
    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, productId), isNull(Product.deletedAt)),
      with: {
        brand: true,
        store: true,
        category: true,
        currency: true,
        productSizes: { with: { size: true } },
        productReviews: { with: { user: true } },
      },
    });

    if (!product) throw new NotFoundException('product not found');

    return product;
  }

  async updateProduct(user: TUser, productId: number, body: Dto.UpdateProductBody, files?: Express.Multer.File[]) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, productId), eq(Product.storeId, storeId), isNull(Product.deletedAt)),
    });

    if (!product) throw new NotFoundException('product not found');

    if (body.brandId) {
      const brand = await this.db.query.Brand.findFirst({ where: eq(Brand.id, body.brandId) });
      if (!brand) throw new NotFoundException('brand not found');
      body.brandId = brand.id;
    }

    if (body.categoryId) {
      const category = await this.db.query.Category.findFirst({ where: eq(Category.id, body.categoryId) });
      if (!category) throw new NotFoundException('category not found');
      body.categoryId = category.id;
    }

    if (body.currencyId) {
      const currency = await this.db.query.Currency.findFirst({ where: eq(Currency.id, body.currencyId) });
      if (!currency) throw new NotFoundException('currency not found');
      body.currencyId = currency.id;
    }

    let images = body.images;
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => this.cloudinaryService.upload(file, 'product-images'));
      const imageUrls = await Promise.all(uploadPromises);
      images = imageUrls.filter((url) => url !== null) as string[];
    }

    if (files && files.length > 0) {
      const imageUrl = await this.cloudinaryService.upload(files[0], 'product-images');
      if (imageUrl) {
        const currentImages = product.images || [];
        images = [...currentImages, imageUrl];
      }
    }

    const [updatedProduct] = await this.db
      .update(Product)
      .set({ ...body, images, updatedAt: new Date() })
      .where(eq(Product.id, productId))
      .returning();

    return await this.getProductById(updatedProduct.id);
  }

  async createProductSize(user: TUser, body: Dto.CreateProductSizeBody) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, body.productId), eq(Product.storeId, storeId), isNull(Product.deletedAt)),
    });

    if (!product) throw new NotFoundException('product not found');

    const size = await this.db.query.Size.findFirst({ where: eq(Size.id, body.sizeId) });
    if (!size) throw new NotFoundException('size not found');

    const [productSize] = await this.db
      .insert(ProductSize)
      .values({ ...body, sizeId: size.id, productId: product.id })
      .returning();

    return productSize;
  }

  async deleteProduct(user: TUser, productId: number) {
    const storeId = user.store?.id;
    if (!storeId) throw new NotFoundException('store not found');

    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, productId), eq(Product.storeId, storeId), isNull(Product.deletedAt)),
    });

    if (!product) throw new NotFoundException('product not found');

    await this.db
      .update(Product)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(Product.id, productId));

    return {};
  }

  async createProductReview(user: TUser, body: Dto.CreateProductReviewBody) {
    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, body.productId), isNull(Product.deletedAt)),
    });

    if (!product) throw new NotFoundException('product not found');

    const deliveredOrder = await this.db.query.Order.findFirst({
      where: and(eq(Order.buyerId, user.id), eq(Order.status, 'delivered')),
      with: { orderItems: { where: eq(OrderItem.productId, body.productId) } },
    });

    if (!deliveredOrder || deliveredOrder.orderItems.length === 0) throw new UnprocessableEntityException();

    const [review] = await this.db
      .insert(ProductReview)
      .values({ ...body, userId: user.id, productId: product.id, isVerified: true })
      .returning();

    return review;
  }

  async getStoreProducts(user: TUser, query: Dto.GetProductsQuery) {
    const storeId = user.store?.id;
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const notDeletedFilter = isNull(Product.deletedAt);
    const storeFilter = storeId ? eq(Product.storeId, storeId) : undefined;
    const brandFilter = query.brandId ? eq(Product.brandId, query.brandId) : undefined;
    const categoryFilter = query.categoryId ? eq(Product.categoryId, query.categoryId) : undefined;
    const queryFilter = q ? or(ilike(Product.name, q), ilike(Product.description || '', q)) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Product.isActive, !!query.isActive) : undefined;
    const featuredFilter = query.isFeatured !== undefined ? eq(Product.isFeatured, !!query.isFeatured) : undefined;

    const [stats] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(
        and(storeFilter, categoryFilter, brandFilter, featuredFilter, activeFilter, queryFilter, notDeletedFilter),
      );

    const data = await this.db.query.Product.findMany({
      limit,
      offset,
      orderBy: desc(Product.createdAt),
      where: and(storeFilter, categoryFilter, brandFilter, featuredFilter, activeFilter, queryFilter, notDeletedFilter),
      with: {
        brand: true,
        category: true,
        currency: true,
        productReviews: true,
        productSizes: { with: { size: true } },
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  private generateSKU(storeId: number, productName: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const storePrefix = storeId.toString().padStart(3, '0');
    const namePrefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3);

    return `${storePrefix}-${namePrefix}-${timestamp}`;
  }
}
