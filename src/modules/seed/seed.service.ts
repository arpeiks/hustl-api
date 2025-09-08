import { go } from '@/utils';
import { DATABASE } from '@/consts';
import { TDatabase } from '@/types';
import { eq, and } from 'drizzle-orm';
import { ArgonService } from '../../services/argon.service';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Currency, Brand, Category, Size, Product, ProductSize, Store, User, Auth } from '../drizzle/schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly argonService: ArgonService,
    @Inject(DATABASE) private readonly db: TDatabase,
  ) {}

  async onModuleInit() {
    console.log('🚀 SeedService initialized, starting automatic seeding...');
    await this.seedDatabase();
  }

  async seedCurrency() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting currency seeding...');

      const ngnCurrencyData = {
        code: 'NGN',
        symbol: '₦',
        isActive: true,
        country: 'Nigeria',
        name: 'Nigerian Naira',
        description: 'The official currency of Nigeria',
        logo: 'https://res.cloudinary.com/abokiafrica/image/upload/v1629298619/flags/NGN.png',
      };

      await this.db
        .insert(Currency)
        .values(ngnCurrencyData)
        .onConflictDoUpdate({
          target: [Currency.code],
          set: { ...ngnCurrencyData, updatedAt: new Date() },
        });
    });

    if (error) return console.error('❌ Error seeding currency:', error);

    return result;
  }

  async seedDatabase() {
    console.log('🌱 Starting comprehensive database seeding...');

    await this.seedCurrency();
    await this.seedBrands();
    await this.seedCategories();
    await this.seedSizes();
    await this.seedUsers();
    await this.seedStores();
    await this.seedProducts();

    console.log('🎉 Comprehensive database seeding completed!');
  }

  async seedBrands() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting brand seeding...');

      const brands = [
        { name: 'Nike', description: 'Just Do It - Athletic wear and footwear' },
        { name: 'Adidas', description: 'Impossible is Nothing - Sports and lifestyle brand' },
        { name: 'Apple', description: 'Think Different - Technology and electronics' },
        { name: 'Samsung', description: 'Innovation for Everyone - Electronics and appliances' },
        { name: 'Sony', description: 'Be Moved - Electronics and entertainment' },
        { name: 'LG', description: "Life's Good - Electronics and home appliances" },
        { name: 'IKEA', description: 'Democratic Design - Furniture and home goods' },
        { name: 'KitchenAid', description: 'Built for the Way You Cook - Kitchen appliances' },
        { name: 'Wilson', description: 'The Official Ball of the NBA - Sports equipment' },
        { name: 'Rolex', description: 'A Crown for Every Achievement - Luxury watches' },
        { name: 'Gucci', description: 'Quality is Remembered Long After Price is Forgotten - Luxury fashion' },
        { name: 'Zara', description: 'Fast Fashion for Everyone - Clothing and accessories' },
      ];

      for (const brand of brands) {
        const existingBrand = await this.db.query.Brand.findFirst({
          where: eq(Brand.name, brand.name),
        });

        if (!existingBrand) {
          await this.db.insert(Brand).values(brand);
          console.log(`✅ Created brand: ${brand.name}`);
        } else {
          console.log(`⏭️  Brand already exists: ${brand.name}`);
        }
      }
    });

    if (error) return console.error('❌ Error seeding brands:', error);
    return result;
  }

  async seedCategories() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting category seeding...');

      const categories = [
        { name: 'Clothing', description: 'All types of clothing and apparel' },
        { name: 'Footwear', description: 'Shoes, boots, sandals and other footwear' },
        { name: 'Accessories', description: 'Jewelry, bags, watches and other accessories' },
        { name: "Men's Clothing", description: 'Clothing specifically for men' },
        { name: "Women's Clothing", description: 'Clothing specifically for women' },
        { name: "Kids' Clothing", description: 'Clothing for children and teenagers' },
        { name: 'Casual Wear', description: 'Everyday casual clothing' },
        { name: 'Formal Wear', description: 'Business and formal attire' },
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Smartphones', description: 'Mobile phones and smartphones' },
        { name: 'Laptops', description: 'Portable computers and laptops' },
        { name: 'Gaming', description: 'Gaming consoles and accessories' },
        { name: 'Home & Garden', description: 'Home improvement, furniture, and garden supplies' },
        { name: 'Kitchen & Dining', description: 'Kitchen appliances, cookware, and dining accessories' },
        { name: 'Kitchen Appliances', description: 'Refrigerators, ovens, microwaves, etc.' },
        { name: 'Cookware', description: 'Pots, pans, utensils, and cooking tools' },
        { name: 'Furniture', description: 'Home and office furniture' },
        { name: 'Living Room Furniture', description: 'Sofas, coffee tables, entertainment centers' },
        { name: 'Bedroom Furniture', description: 'Beds, dressers, nightstands, wardrobes' },
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
    });

    if (error) return console.error('❌ Error seeding categories:', error);
    return result;
  }

  async seedSizes() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting size seeding...');

      const sizes = [
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
        { name: 'Storage Capacity', value: '64GB', categoryName: 'Smartphones' },
        { name: 'Storage Capacity', value: '128GB', categoryName: 'Smartphones' },
        { name: 'Storage Capacity', value: '256GB', categoryName: 'Smartphones' },
        { name: 'Storage Capacity', value: '512GB', categoryName: 'Smartphones' },
        { name: 'Screen Size', value: '13 inch', categoryName: 'Laptops' },
        { name: 'Screen Size', value: '14 inch', categoryName: 'Laptops' },
        { name: 'Screen Size', value: '15.6 inch', categoryName: 'Laptops' },
        { name: 'Screen Size', value: '17 inch', categoryName: 'Laptops' },
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
        const category = await this.db.query.Category.findFirst({
          where: eq(Category.name, size.categoryName),
        });

        if (category) {
          const existingSize = await this.db.query.Size.findFirst({
            where: and(eq(Size.name, size.name), eq(Size.value, size.value), eq(Size.categoryId, category.id)),
          });

          if (!existingSize) {
            await this.db.insert(Size).values({
              name: size.name,
              value: size.value,
              categoryId: category.id,
            });
            console.log(`✅ Created size: ${size.name} - ${size.value} for ${size.categoryName}`);
          } else {
            console.log(`⏭️  Size already exists: ${size.name} - ${size.value} for ${size.categoryName}`);
          }
        }
      }
    });

    if (error) return console.error('❌ Error seeding sizes:', error);
    return result;
  }

  async seedUsers() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting user seeding...');

      const users = [
        {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          role: 'artisan' as const,
          bio: 'Professional artisan with 10+ years experience',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
        },
        {
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          role: 'artisan' as const,
          bio: 'Creative designer specializing in custom products',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
        },
        {
          fullName: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1234567892',
          role: 'user' as const,
          bio: 'Tech enthusiast and gadget collector',
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
        },
        {
          fullName: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+1234567893',
          role: 'artisan' as const,
          bio: 'Handcrafted jewelry and accessories maker',
          address: '321 Elm St',
          city: 'Miami',
          state: 'FL',
        },
        {
          fullName: 'David Brown',
          email: 'david.brown@example.com',
          phone: '+1234567894',
          role: 'user' as const,
          bio: 'Sports equipment collector and enthusiast',
          address: '654 Maple Dr',
          city: 'Seattle',
          state: 'WA',
        },
      ];

      for (const userData of users) {
        const existingUser = await this.db.query.User.findFirst({
          where: eq(User.email, userData.email),
        });

        if (!existingUser) {
          const [user] = await this.db.insert(User).values(userData).returning();

          const hashedPassword = await this.argonService.hash('password123');
          await this.db.insert(Auth).values({
            userId: user.id,
            password: hashedPassword,
          });

          console.log(`✅ Created user: ${userData.fullName}`);
        } else {
          console.log(`⏭️  User already exists: ${userData.fullName}`);
        }
      }
    });

    if (error) return console.error('❌ Error seeding users:', error);
    return result;
  }

  async seedStores() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting store seeding...');

      const artisanUsers = await this.db.query.User.findMany({
        where: eq(User.role, 'artisan'),
      });

      const stores = [
        {
          name: 'TechHub Electronics',
          description: 'Premium electronics and gadgets store',
          address: '123 Tech Street, Silicon Valley, CA',
          phone: '+1-555-TECH-001',
          isOnline: true,
          offerDeliveryService: true,
          deliveryRadius: 50,
          deliveryFee: 1000,
          bankName: 'Tech Bank',
          accountNumber: '1234567890',
          accountName: 'TechHub Electronics',
          payoutSchedule: 'weekly',
        },
        {
          name: 'Fashion Forward',
          description: 'Trendy clothing and accessories boutique',
          address: '456 Fashion Ave, New York, NY',
          phone: '+1-555-FASHION',
          isOnline: true,
          offerDeliveryService: true,
          deliveryRadius: 25,
          deliveryFee: 500,
          bankName: 'Fashion Bank',
          accountNumber: '2345678901',
          accountName: 'Fashion Forward',
          payoutSchedule: 'bi-weekly',
        },
        {
          name: 'Home & Garden Paradise',
          description: 'Everything for your home and garden',
          address: '789 Garden Way, Portland, OR',
          phone: '+1-555-GARDEN',
          isOnline: true,
          offerDeliveryService: true,
          deliveryRadius: 30,
          deliveryFee: 750,
          bankName: 'Home Bank',
          accountNumber: '3456789012',
          accountName: 'Home & Garden Paradise',
          payoutSchedule: 'weekly',
        },
        {
          name: 'Sports Central',
          description: 'Professional sports equipment and gear',
          address: '321 Sports Blvd, Boston, MA',
          phone: '+1-555-SPORTS',
          isOnline: true,
          offerDeliveryService: true,
          deliveryRadius: 40,
          deliveryFee: 800,
          bankName: 'Sports Bank',
          accountNumber: '4567890123',
          accountName: 'Sports Central',
          payoutSchedule: 'monthly',
        },
        {
          name: 'Jewelry Craft Studio',
          description: 'Handcrafted jewelry and luxury accessories',
          address: '654 Craft Lane, Miami, FL',
          phone: '+1-555-JEWELRY',
          isOnline: true,
          offerDeliveryService: true,
          deliveryRadius: 20,
          deliveryFee: 1200,
          bankName: 'Luxury Bank',
          accountNumber: '5678901234',
          accountName: 'Jewelry Craft Studio',
          payoutSchedule: 'weekly',
        },
      ];

      for (let i = 0; i < stores.length && i < artisanUsers.length; i++) {
        const storeData = stores[i];
        const owner = artisanUsers[i];

        const existingStore = await this.db.query.Store.findFirst({
          where: eq(Store.name, storeData.name),
        });

        if (!existingStore) {
          await this.db.insert(Store).values({
            ...storeData,
            ownerId: owner.id,
          });
          console.log(`✅ Created store: ${storeData.name}`);
        } else {
          console.log(`⏭️  Store already exists: ${storeData.name}`);
        }
      }
    });

    if (error) return console.error('❌ Error seeding stores:', error);
    return result;
  }

  async seedProducts() {
    const [result, error] = await go(async () => {
      console.log('🌱 Starting product seeding...');

      const ngnCurrency = await this.db.query.Currency.findFirst({
        where: eq(Currency.code, 'NGN'),
      });

      if (!ngnCurrency) {
        console.error('❌ NGN currency not found. Please seed currency first.');
        return;
      }

      const brands = await this.db.query.Brand.findMany();
      const categories = await this.db.query.Category.findMany();
      const stores = await this.db.query.Store.findMany();
      const sizes = await this.db.query.Size.findMany();

      const products = [
        {
          sku: 'NIKE-AIR-MAX-001',
          name: 'Nike Air Max 270',
          description: 'Comfortable running shoes with Max Air cushioning',
          price: 45000,
          brandName: 'Nike',
          categoryName: 'Footwear',
          storeName: 'TechHub Electronics',
          images: [
            'https://res.cloudinary.com/example/nike-air-max-270-1.jpg',
            'https://res.cloudinary.com/example/nike-air-max-270-2.jpg',
          ],
          stockQuantity: 50,
          isFeatured: true,
          sizes: [
            { sizeName: "Men's Shoe Size", sizeValue: '8', price: 45000, stock: 10 },
            { sizeName: "Men's Shoe Size", sizeValue: '9', price: 45000, stock: 15 },
            { sizeName: "Men's Shoe Size", sizeValue: '10', price: 45000, stock: 12 },
          ],
        },
        {
          sku: 'APPLE-IPHONE-15-001',
          name: 'iPhone 15 Pro',
          description: 'Latest iPhone with A17 Pro chip and titanium design',
          price: 120000,
          brandName: 'Apple',
          categoryName: 'Smartphones',
          storeName: 'TechHub Electronics',
          images: [
            'https://res.cloudinary.com/example/iphone-15-pro-1.jpg',
            'https://res.cloudinary.com/example/iphone-15-pro-2.jpg',
          ],
          stockQuantity: 25,
          isFeatured: true,
          sizes: [
            { sizeName: 'Storage Capacity', sizeValue: '128GB', price: 120000, stock: 8 },
            { sizeName: 'Storage Capacity', sizeValue: '256GB', price: 135000, stock: 10 },
            { sizeName: 'Storage Capacity', sizeValue: '512GB', price: 150000, stock: 7 },
          ],
        },
        {
          sku: 'SAMSUNG-GALAXY-S24-001',
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Premium Android smartphone with S Pen and AI features',
          price: 110000,
          brandName: 'Samsung',
          categoryName: 'Smartphones',
          storeName: 'TechHub Electronics',
          images: [
            'https://res.cloudinary.com/example/galaxy-s24-ultra-1.jpg',
            'https://res.cloudinary.com/example/galaxy-s24-ultra-2.jpg',
          ],
          stockQuantity: 30,
          isFeatured: false,
          sizes: [
            { sizeName: 'Storage Capacity', sizeValue: '256GB', price: 110000, stock: 12 },
            { sizeName: 'Storage Capacity', sizeValue: '512GB', price: 125000, stock: 10 },
            { sizeName: 'Storage Capacity', sizeValue: '1TB', price: 140000, stock: 8 },
          ],
        },
        {
          sku: 'MACBOOK-PRO-M3-001',
          name: 'MacBook Pro 14-inch M3',
          description: 'Powerful laptop with M3 chip for professionals',
          price: 250000,
          brandName: 'Apple',
          categoryName: 'Laptops',
          storeName: 'TechHub Electronics',
          images: [
            'https://res.cloudinary.com/example/macbook-pro-m3-1.jpg',
            'https://res.cloudinary.com/example/macbook-pro-m3-2.jpg',
          ],
          stockQuantity: 15,
          isFeatured: true,
          sizes: [
            { sizeName: 'Screen Size', sizeValue: '14 inch', price: 250000, stock: 8 },
            { sizeName: 'Screen Size', sizeValue: '16 inch', price: 280000, stock: 7 },
          ],
        },
        {
          sku: 'NIKE-TEE-CLASSIC-001',
          name: 'Nike Classic T-Shirt',
          description: 'Comfortable cotton t-shirt with Nike logo',
          price: 8500,
          brandName: 'Nike',
          categoryName: "Men's Clothing",
          storeName: 'Fashion Forward',
          images: [
            'https://res.cloudinary.com/example/nike-tee-classic-1.jpg',
            'https://res.cloudinary.com/example/nike-tee-classic-2.jpg',
          ],
          stockQuantity: 100,
          isFeatured: false,
          sizes: [
            { sizeName: 'T-Shirt Size', sizeValue: 'S', price: 8500, stock: 20 },
            { sizeName: 'T-Shirt Size', sizeValue: 'M', price: 8500, stock: 25 },
            { sizeName: 'T-Shirt Size', sizeValue: 'L', price: 8500, stock: 30 },
            { sizeName: 'T-Shirt Size', sizeValue: 'XL', price: 8500, stock: 15 },
          ],
        },
        {
          sku: 'GUCCI-HANDBAG-001',
          name: 'Gucci GG Marmont Handbag',
          description: 'Luxury handbag with iconic GG logo',
          price: 180000,
          brandName: 'Gucci',
          categoryName: 'Accessories',
          storeName: 'Fashion Forward',
          images: [
            'https://res.cloudinary.com/example/gucci-handbag-1.jpg',
            'https://res.cloudinary.com/example/gucci-handbag-2.jpg',
          ],
          stockQuantity: 5,
          isFeatured: true,
          sizes: [],
        },
        {
          sku: 'ROLEX-SUBMARINER-001',
          name: 'Rolex Submariner',
          description: 'Iconic diving watch with automatic movement',
          price: 500000,
          brandName: 'Rolex',
          categoryName: 'Accessories',
          storeName: 'Jewelry Craft Studio',
          images: [
            'https://res.cloudinary.com/example/rolex-submariner-1.jpg',
            'https://res.cloudinary.com/example/rolex-submariner-2.jpg',
          ],
          stockQuantity: 2,
          isFeatured: true,
          sizes: [
            { sizeName: 'Watch Band Size', sizeValue: 'Medium (7-8 inch)', price: 500000, stock: 1 },
            { sizeName: 'Watch Band Size', sizeValue: 'Large (8-9 inch)', price: 500000, stock: 1 },
          ],
        },
        {
          sku: 'IKEA-KLIPPAN-SOFA-001',
          name: 'IKEA Klippan Sofa',
          description: 'Comfortable 2-seater sofa in various colors',
          price: 45000,
          brandName: 'IKEA',
          categoryName: 'Living Room Furniture',
          storeName: 'Home & Garden Paradise',
          images: [
            'https://res.cloudinary.com/example/ikea-klippan-1.jpg',
            'https://res.cloudinary.com/example/ikea-klippan-2.jpg',
          ],
          stockQuantity: 20,
          isFeatured: false,
          sizes: [
            { sizeName: 'Sofa Size', sizeValue: '2-Seater', price: 45000, stock: 10 },
            { sizeName: 'Sofa Size', sizeValue: '3-Seater', price: 55000, stock: 10 },
          ],
        },
        {
          sku: 'KITCHENAID-MIXER-001',
          name: 'KitchenAid Stand Mixer',
          description: 'Professional stand mixer for baking enthusiasts',
          price: 85000,
          brandName: 'KitchenAid',
          categoryName: 'Kitchen Appliances',
          storeName: 'Home & Garden Paradise',
          images: [
            'https://res.cloudinary.com/example/kitchenaid-mixer-1.jpg',
            'https://res.cloudinary.com/example/kitchenaid-mixer-2.jpg',
          ],
          stockQuantity: 12,
          isFeatured: true,
          sizes: [],
        },
        {
          sku: 'WILSON-BASKETBALL-001',
          name: 'Wilson Evolution Basketball',
          description: 'Official game ball used in high school basketball',
          price: 12000,
          brandName: 'Wilson',
          categoryName: 'Team Sports',
          storeName: 'Sports Central',
          images: [
            'https://res.cloudinary.com/example/wilson-basketball-1.jpg',
            'https://res.cloudinary.com/example/wilson-basketball-2.jpg',
          ],
          stockQuantity: 50,
          isFeatured: false,
          sizes: [
            { sizeName: 'Basketball Size', sizeValue: 'Size 6', price: 12000, stock: 20 },
            { sizeName: 'Basketball Size', sizeValue: 'Size 7', price: 12000, stock: 30 },
          ],
        },
      ];

      for (const productData of products) {
        const brand = brands.find((b) => b.name === productData.brandName);
        const category = categories.find((c) => c.name === productData.categoryName);
        const store = stores.find((s) => s.name === productData.storeName);

        if (!brand || !category || !store) {
          console.log(`⚠️  Skipping product ${productData.name} - missing dependencies`);
          continue;
        }

        const existingProduct = await this.db.query.Product.findFirst({
          where: eq(Product.sku, productData.sku),
        });

        if (!existingProduct) {
          const [product] = await this.db
            .insert(Product)
            .values({
              sku: productData.sku,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              currencyId: ngnCurrency.id,
              brandId: brand.id,
              categoryId: category.id,
              storeId: store.id,
              images: productData.images,
              stockQuantity: productData.stockQuantity,
              isFeatured: productData.isFeatured,
            })
            .returning();

          for (const sizeData of productData.sizes) {
            const size = sizes.find((s) => s.name === sizeData.sizeName && s.value === sizeData.sizeValue);
            if (size) {
              await this.db.insert(ProductSize).values({
                productId: product.id,
                sizeId: size.id,
                price: sizeData.price,
                stockQuantity: sizeData.stock,
              });
            }
          }

          console.log(`✅ Created product: ${productData.name}`);
        } else {
          console.log(`⏭️  Product already exists: ${productData.name}`);
        }
      }
    });

    if (error) return console.error('❌ Error seeding products:', error);
    return result;
  }
}
