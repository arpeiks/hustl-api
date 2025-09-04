import * as Dto from './dto';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { generatePagination, getPage } from '@/utils';
import { eq, and, desc, count, or, ilike } from 'drizzle-orm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Product, ProductSize, ProductReview, TUser } from '../drizzle/schema';

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATABASE) private readonly db: TDatabase,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createProduct(vendor: TUser, body: Dto.CreateProductBody, file?: Express.Multer.File) {
    const sku = this.generateSKU(vendor.id, body.name);

    let images: string[] | undefined;
    if (file) {
      const imageUrl = await this.cloudinaryService.upload(file, 'product-images');
      if (imageUrl) {
        images = [imageUrl];
      }
    }

    const [product] = await this.db
      .insert(Product)
      .values({ ...body, sku, vendorId: vendor.id, images })
      .returning();

    return await this.getProductById(product.id);
  }

  async getProducts(query: Dto.GetProductsQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const categoryFilter = query.categoryId ? eq(Product.categoryId, query.categoryId) : undefined;
    const brandFilter = query.brandId ? eq(Product.brandId, query.brandId) : undefined;
    const vendorFilter = query.vendorId ? eq(Product.vendorId, query.vendorId) : undefined;
    const featuredFilter = query.isFeatured !== undefined ? eq(Product.isFeatured, query.isFeatured) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Product.isActive, query.isActive) : undefined;

    const queryFilter = q ? or(ilike(Product.name, q), ilike(Product.description || '', q)) : undefined;

    const [stats] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(and(categoryFilter, brandFilter, vendorFilter, featuredFilter, activeFilter, queryFilter));

    const data = await this.db.query.Product.findMany({
      limit,
      offset,
      where: and(categoryFilter, brandFilter, vendorFilter, featuredFilter, activeFilter, queryFilter),
      orderBy: desc(Product.createdAt),
      with: {
        brand: true,
        category: true,
        vendor: true,
        currency: true,
        productSizes: {
          with: { size: true },
        },
        productReviews: true,
      },
    });

    const total = stats.count || 0;
    const pagination = generatePagination(query.page, query.pageSize, total);
    return { data, pagination };
  }

  async getProductById(productId: number) {
    const product = await this.db.query.Product.findFirst({
      where: eq(Product.id, productId),
      with: {
        brand: true,
        vendor: true,
        category: true,
        currency: true,
        productSizes: { with: { size: true } },
        productReviews: { with: { user: true } },
      },
    });

    if (!product) throw new NotFoundException('product not found');

    return product;
  }

  async updateProduct(vendor: TUser, productId: number, body: Dto.UpdateProductBody, file?: Express.Multer.File) {
    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, productId), eq(Product.vendorId, vendor.id)),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let images = body.images;
    if (file) {
      const imageUrl = await this.cloudinaryService.upload(file, 'product-images');
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

  async deleteProduct(vendor: TUser, productId: number) {
    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, productId), eq(Product.vendorId, vendor.id)),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.db.delete(Product).where(eq(Product.id, productId));
    return { success: true };
  }

  async createProductSize(vendor: TUser, body: Dto.CreateProductSizeBody) {
    const product = await this.db.query.Product.findFirst({
      where: and(eq(Product.id, body.productId), eq(Product.vendorId, vendor.id)),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [productSize] = await this.db.insert(ProductSize).values(body).returning();

    return productSize;
  }

  async createProductReview(user: TUser, body: Dto.CreateProductReviewBody) {
    const product = await this.db.query.Product.findFirst({
      where: eq(Product.id, body.productId),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [review] = await this.db
      .insert(ProductReview)
      .values({
        ...body,
        userId: user.id,
      })
      .returning();

    return review;
  }

  async getVendorProducts(vendor: TUser, query: Dto.GetProductsQuery) {
    const { limit, offset } = getPage(query);
    const q = query.q ? `%${query.q}%` : undefined;
    const vendorFilter = eq(Product.vendorId, vendor.id);
    const brandFilter = query.brandId ? eq(Product.brandId, query.brandId) : undefined;
    const categoryFilter = query.categoryId ? eq(Product.categoryId, query.categoryId) : undefined;
    const queryFilter = q ? or(ilike(Product.name, q), ilike(Product.description || '', q)) : undefined;
    const activeFilter = query.isActive !== undefined ? eq(Product.isActive, query.isActive) : undefined;
    const featuredFilter = query.isFeatured !== undefined ? eq(Product.isFeatured, query.isFeatured) : undefined;

    const [stats] = await this.db
      .select({ count: count(Product.id) })
      .from(Product)
      .where(and(vendorFilter, categoryFilter, brandFilter, featuredFilter, activeFilter, queryFilter));

    const data = await this.db.query.Product.findMany({
      limit,
      offset,
      orderBy: desc(Product.createdAt),
      where: and(vendorFilter, categoryFilter, brandFilter, featuredFilter, activeFilter, queryFilter),
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

  private generateSKU(vendorId: number, productName: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const vendorPrefix = vendorId.toString().padStart(3, '0');
    const namePrefix = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3);

    return `${vendorPrefix}-${namePrefix}-${timestamp}`;
  }
}
