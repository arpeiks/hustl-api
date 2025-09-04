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

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Seed Categories
    const categories = [
      // Clothing hierarchy
      { name: 'Clothing', description: 'All types of clothing and apparel' },
      { name: 'Footwear', description: 'Shoes, boots, sandals and other footwear' },
      { name: 'Accessories', description: 'Jewelry, bags, watches and other accessories' },
      { name: "Men's Clothing", description: 'Clothing specifically for men' },
      { name: "Women's Clothing", description: 'Clothing specifically for women' },
      { name: "Kids' Clothing", description: 'Clothing for children and teenagers' },
      { name: 'Casual Wear', description: 'Everyday casual clothing' },
      { name: 'Formal Wear', description: 'Business and formal attire' },

      // Electronics hierarchy
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Smartphones', description: 'Mobile phones and smartphones' },
      { name: 'Laptops', description: 'Portable computers and laptops' },
      { name: 'Gaming', description: 'Gaming consoles and accessories' },

      // Home & Garden hierarchy
      { name: 'Home & Garden', description: 'Home improvement, furniture, and garden supplies' },
      { name: 'Kitchen & Dining', description: 'Kitchen appliances, cookware, and dining accessories' },
      { name: 'Kitchen Appliances', description: 'Refrigerators, ovens, microwaves, etc.' },
      { name: 'Cookware', description: 'Pots, pans, utensils, and cooking tools' },
      { name: 'Furniture', description: 'Home and office furniture' },
      { name: 'Living Room Furniture', description: 'Sofas, coffee tables, entertainment centers' },
      { name: 'Bedroom Furniture', description: 'Beds, dressers, nightstands, wardrobes' },

      // Sports & Outdoor hierarchy
      { name: 'Sports & Outdoor', description: 'Sports equipment, outdoor gear, and fitness' },
      { name: 'Team Sports', description: 'Football, basketball, soccer, baseball equipment' },
      { name: 'Individual Sports', description: 'Tennis, golf, swimming, running gear' },
      { name: 'Outdoor Recreation', description: 'Camping, hiking, fishing, hunting gear' },
    ];

    const categoryMap = new Map<string, number>();

    for (const category of categories) {
      const existingCategory = await this.db.query.Category.findFirst({
        where: eq(Category.name, category.name),
      });

      if (!existingCategory) {
        const [newCategory] = await this.db.insert(Category).values(category).returning();
        categoryMap.set(category.name, newCategory.id);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        categoryMap.set(category.name, existingCategory.id);
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    // Update parent relationships
    const parentRelationships = [
      { child: "Men's Clothing", parent: 'Clothing' },
      { child: "Women's Clothing", parent: 'Clothing' },
      { child: "Kids' Clothing", parent: 'Clothing' },
      { child: 'Casual Wear', parent: "Men's Clothing" },
      { child: 'Formal Wear', parent: "Men's Clothing" },
      { child: 'Smartphones', parent: 'Electronics' },
      { child: 'Laptops', parent: 'Electronics' },
      { child: 'Gaming', parent: 'Electronics' },
      { child: 'Kitchen & Dining', parent: 'Home & Garden' },
      { child: 'Kitchen Appliances', parent: 'Kitchen & Dining' },
      { child: 'Cookware', parent: 'Kitchen & Dining' },
      { child: 'Furniture', parent: 'Home & Garden' },
      { child: 'Living Room Furniture', parent: 'Furniture' },
      { child: 'Bedroom Furniture', parent: 'Furniture' },
      { child: 'Team Sports', parent: 'Sports & Outdoor' },
      { child: 'Individual Sports', parent: 'Sports & Outdoor' },
      { child: 'Outdoor Recreation', parent: 'Sports & Outdoor' },
    ];

    for (const relation of parentRelationships) {
      const childId = categoryMap.get(relation.child);
      const parentId = categoryMap.get(relation.parent);

      if (childId && parentId) {
        await this.db.update(Category).set({ parentId }).where(eq(Category.id, childId));
        console.log(`🔗 Linked ${relation.child} to ${relation.parent}`);
      }
    }

    // Seed Sizes
    const sizes = [
      // Clothing sizes
      { name: 'T-Shirt Size', value: 'XS', categoryName: "Men's Clothing" },
      { name: 'T-Shirt Size', value: 'S', categoryName: "Men's Clothing" },
      { name: 'T-Shirt Size', value: 'M', categoryName: "Men's Clothing" },
      { name: 'T-Shirt Size', value: 'L', categoryName: "Men's Clothing" },
      { name: 'T-Shirt Size', value: 'XL', categoryName: "Men's Clothing" },
      { name: 'T-Shirt Size', value: 'XXL', categoryName: "Men's Clothing" },

      { name: 'Dress Size', value: '2', categoryName: "Women's Clothing" },
      { name: 'Dress Size', value: '4', categoryName: "Women's Clothing" },
      { name: 'Dress Size', value: '6', categoryName: "Women's Clothing" },
      { name: 'Dress Size', value: '8', categoryName: "Women's Clothing" },
      { name: 'Dress Size', value: '10', categoryName: "Women's Clothing" },
      { name: 'Dress Size', value: '12', categoryName: "Women's Clothing" },

      // Footwear sizes
      { name: "Men's Shoe Size", value: '7', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '7.5', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '8', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '8.5', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '9', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '9.5', categoryName: 'Footwear' },
      { name: "Men's Shoe Size", value: '10', categoryName: 'Footwear' },

      { name: "Women's Shoe Size", value: '5', categoryName: 'Footwear' },
      { name: "Women's Shoe Size", value: '5.5', categoryName: 'Footwear' },
      { name: "Women's Shoe Size", value: '6', categoryName: 'Footwear' },
      { name: "Women's Shoe Size", value: '6.5', categoryName: 'Footwear' },
      { name: "Women's Shoe Size", value: '7', categoryName: 'Footwear' },

      // Electronics sizes
      { name: 'Storage Capacity', value: '64GB', categoryName: 'Smartphones' },
      { name: 'Storage Capacity', value: '128GB', categoryName: 'Smartphones' },
      { name: 'Storage Capacity', value: '256GB', categoryName: 'Smartphones' },
      { name: 'Storage Capacity', value: '512GB', categoryName: 'Smartphones' },

      { name: 'Screen Size', value: '13 inch', categoryName: 'Laptops' },
      { name: 'Screen Size', value: '14 inch', categoryName: 'Laptops' },
      { name: 'Screen Size', value: '15.6 inch', categoryName: 'Laptops' },
      { name: 'Screen Size', value: '17 inch', categoryName: 'Laptops' },

      // Kitchen sizes
      { name: 'Pan Size', value: '8 inch', categoryName: 'Cookware' },
      { name: 'Pan Size', value: '10 inch', categoryName: 'Cookware' },
      { name: 'Pan Size', value: '12 inch', categoryName: 'Cookware' },
      { name: 'Pan Size', value: '14 inch', categoryName: 'Cookware' },

      { name: 'Pot Capacity', value: '2 quarts', categoryName: 'Cookware' },
      { name: 'Pot Capacity', value: '4 quarts', categoryName: 'Cookware' },
      { name: 'Pot Capacity', value: '6 quarts', categoryName: 'Cookware' },
      { name: 'Pot Capacity', value: '8 quarts', categoryName: 'Cookware' },

      { name: 'Plate Size', value: '6 inch', categoryName: 'Kitchen & Dining' },
      { name: 'Plate Size', value: '8 inch', categoryName: 'Kitchen & Dining' },
      { name: 'Plate Size', value: '10 inch', categoryName: 'Kitchen & Dining' },
      { name: 'Plate Size', value: '12 inch', categoryName: 'Kitchen & Dining' },

      // Furniture sizes
      { name: 'Bed Size', value: 'Twin', categoryName: 'Bedroom Furniture' },
      { name: 'Bed Size', value: 'Twin XL', categoryName: 'Bedroom Furniture' },
      { name: 'Bed Size', value: 'Full', categoryName: 'Bedroom Furniture' },
      { name: 'Bed Size', value: 'Queen', categoryName: 'Bedroom Furniture' },
      { name: 'Bed Size', value: 'King', categoryName: 'Bedroom Furniture' },
      { name: 'Bed Size', value: 'California King', categoryName: 'Bedroom Furniture' },

      { name: 'Sofa Size', value: '2-Seater', categoryName: 'Living Room Furniture' },
      { name: 'Sofa Size', value: '3-Seater', categoryName: 'Living Room Furniture' },
      { name: 'Sofa Size', value: '4-Seater', categoryName: 'Living Room Furniture' },
      { name: 'Sofa Size', value: '5-Seater', categoryName: 'Living Room Furniture' },
      { name: 'Sofa Size', value: 'Sectional', categoryName: 'Living Room Furniture' },

      // Sports sizes
      { name: 'Basketball Size', value: 'Size 5', categoryName: 'Team Sports' },
      { name: 'Basketball Size', value: 'Size 6', categoryName: 'Team Sports' },
      { name: 'Basketball Size', value: 'Size 7', categoryName: 'Team Sports' },

      { name: 'Grip Size', value: '4 1/8 inch', categoryName: 'Individual Sports' },
      { name: 'Grip Size', value: '4 1/4 inch', categoryName: 'Individual Sports' },
      { name: 'Grip Size', value: '4 3/8 inch', categoryName: 'Individual Sports' },
      { name: 'Grip Size', value: '4 1/2 inch', categoryName: 'Individual Sports' },
      { name: 'Grip Size', value: '4 5/8 inch', categoryName: 'Individual Sports' },

      { name: 'Club Length', value: 'Standard', categoryName: 'Individual Sports' },
      { name: 'Club Length', value: '1 inch longer', categoryName: 'Individual Sports' },
      { name: 'Club Length', value: '1 inch shorter', categoryName: 'Individual Sports' },

      // Accessories sizes
      { name: 'Watch Band Size', value: 'Small (6-7 inch)', categoryName: 'Accessories' },
      { name: 'Watch Band Size', value: 'Medium (7-8 inch)', categoryName: 'Accessories' },
      { name: 'Watch Band Size', value: 'Large (8-9 inch)', categoryName: 'Accessories' },

      { name: 'Ring Size', value: '5', categoryName: 'Accessories' },
      { name: 'Ring Size', value: '6', categoryName: 'Accessories' },
      { name: 'Ring Size', value: '7', categoryName: 'Accessories' },
      { name: 'Ring Size', value: '8', categoryName: 'Accessories' },
      { name: 'Ring Size', value: '9', categoryName: 'Accessories' },
    ];

    for (const size of sizes) {
      const categoryId = categoryMap.get(size.categoryName);

      if (categoryId) {
        const existingSize = await this.db.query.Size.findFirst({
          where: and(eq(Size.name, size.name), eq(Size.value, size.value), eq(Size.categoryId, categoryId)),
        });

        if (!existingSize) {
          await this.db.insert(Size).values({
            name: size.name,
            value: size.value,
            categoryId,
          });
          console.log(`✅ Created size: ${size.name} - ${size.value} for ${size.categoryName}`);
        } else {
          console.log(`⏭️  Size already exists: ${size.name} - ${size.value} for ${size.categoryName}`);
        }
      }
    }

    console.log('🎉 Database seeding completed!');
  }
}
