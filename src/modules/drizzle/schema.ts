import {
  text,
  serial,
  pgEnum,
  unique,
  varchar,
  integer,
  boolean,
  pgSchema,
  timestamp,
  PgTimestampConfig,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const hustlSchema = pgSchema('hustl');

const tzConfig: PgTimestampConfig = { withTimezone: true };

const timestamps = {
  deletedAt: timestamp(tzConfig),
  createdAt: timestamp(tzConfig).defaultNow().notNull(),
  updatedAt: timestamp(tzConfig).defaultNow().notNull(),
};

export const OtpTypeMap = [
  'PHONE_VERIFICATION',
  'EMAIL_VERIFICATION',
  'EMAIL_PASSWORD_RESET',
  'PHONE_PASSWORD_RESET',
] as const;
export const OtpTypeEnum = pgEnum('otp_type', OtpTypeMap);
export type TOtpType = (typeof OtpTypeEnum.enumValues)[number];

export const RoleMap = ['user', 'artisan', 'admin'] as const;
export const RoleEnum = pgEnum('role', RoleMap);
export type TRole = (typeof RoleEnum.enumValues)[number];

export const SubscriptionStatusMap = ['active', 'expired', 'cancelled'] as const;
export const SubscriptionStatusEnum = pgEnum('subscription_status', SubscriptionStatusMap);
export type TSubscriptionStatus = (typeof SubscriptionStatusEnum.enumValues)[number];

export const IntervalUnitMap = ['day', 'week', 'month', 'year'] as const;
export const IntervalUnitEnum = pgEnum('interval_unit', IntervalUnitMap);
export type TIntervalUnit = (typeof IntervalUnitEnum.enumValues)[number];

export const WalletTypeMap = ['personal', 'business'] as const;
export const WalletTypeEnum = pgEnum('wallet_type', WalletTypeMap);
export type TWalletType = (typeof WalletTypeEnum.enumValues)[number];

export const OrderStatusMap = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export const OrderStatusEnum = pgEnum('order_status', OrderStatusMap);
export type TOrderStatus = (typeof OrderStatusEnum.enumValues)[number];

export const PaymentStatusMap = ['pending', 'paid', 'failed', 'refunded'] as const;
export const PaymentStatusEnum = pgEnum('payment_status', PaymentStatusMap);
export type TPaymentStatus = (typeof PaymentStatusEnum.enumValues)[number];

export const PaymentMethodMap = ['wallet', 'card', 'bank_transfer', 'cash'] as const;
export const PaymentMethodEnum = pgEnum('payment_method', PaymentMethodMap);
export type TPaymentMethod = (typeof PaymentMethodEnum.enumValues)[number];

export type TAuth = typeof Auth.$inferSelect;
export type TSize = typeof Size.$inferSelect;
export type TBrand = typeof Brand.$inferSelect;
export type TOrder = typeof Order.$inferSelect;
export type TWallet = typeof Wallet.$inferSelect;
export type TService = typeof Service.$inferSelect;
export type TProduct = typeof Product.$inferSelect;
export type TCurrency = typeof Currency.$inferSelect;
export type TCategory = typeof Category.$inferSelect;
export type TOrderItem = typeof OrderItem.$inferSelect;
export type TUserService = typeof UserService.$inferSelect;
export type TProductSize = typeof ProductSize.$inferSelect;
export type TSubscription = typeof Subscription.$inferSelect;
export type TNotification = typeof Notification.$inferSelect;
export type TProductReview = typeof ProductReview.$inferSelect;
export type TUser = typeof User.$inferSelect & { auth?: TAuth };
export type TSubscriptionPlan = typeof SubscriptionPlan.$inferSelect;
export type TSubscriptionFeature = typeof SubscriptionFeature.$inferSelect;
export type TNotificationSetting = typeof NotificationSetting.$inferSelect;
export type TSubscriptionPlanFeature = typeof SubscriptionPlanFeature.$inferSelect;

export const User = hustlSchema.table('user', {
  id: serial().primaryKey(),
  role: RoleEnum().notNull().default('artisan'),
  bio: varchar(),
  fullName: varchar().notNull(),
  email: varchar().unique().notNull(),
  phone: varchar().unique().notNull(),
  avatar: varchar(),
  address: varchar(),
  city: varchar(),
  state: varchar(),
  emailVerifiedAt: timestamp(tzConfig),
  phoneVerifiedAt: timestamp(tzConfig),
  ...timestamps,
});

export const NotificationSetting = hustlSchema.table('notification_setting', {
  id: serial().primaryKey(),
  map: boolean().default(false),
  chat: boolean().default(false),
  email: boolean().default(false),
  phone: boolean().default(false),
  order: boolean().default(false),
  userId: integer()
    .references(() => User.id)
    .notNull(),
  ...timestamps,
});

export const Notification = hustlSchema.table('notification', {
  id: serial().primaryKey(),
  title: varchar().notNull(),
  message: text().notNull(),
  type: varchar().notNull(),
  isRead: boolean().default(false),
  userId: integer()
    .references(() => User.id)
    .notNull(),
  ...timestamps,
});

export const Auth = hustlSchema.table('auth', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => User.id)
    .notNull()
    .unique(),
  password: text().notNull(),
  token: text(),
  ...timestamps,
});

export const Otp = hustlSchema.table('otp', {
  id: serial('id').primaryKey(),
  code: varchar('code'),
  type: OtpTypeEnum('type'),
  identifier: varchar('identifier'),
  expiredAt: timestamp('expired_at', tzConfig).defaultNow(),
  createdAt: timestamp('created_at', tzConfig).defaultNow(),
  updatedAt: timestamp('updated_at', tzConfig).defaultNow(),
});

export const Service = hustlSchema.table('service_listing', {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  description: text(),
  ...timestamps,
});

export const UserService = hustlSchema.table(
  'user_service',
  {
    id: serial().primaryKey(),
    userId: integer()
      .references(() => User.id)
      .notNull(),
    serviceId: integer()
      .references(() => Service.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.userId, t.serviceId)],
);

export const Currency = hustlSchema.table('currency', {
  id: serial().primaryKey(),
  name: varchar().notNull().unique(),
  country: text(),
  description: text(),
  code: varchar().notNull().unique(),
  logo: varchar(),
  symbol: varchar(),
  isActive: boolean().default(true),
  ...timestamps,
});

export const SubscriptionFeature = hustlSchema.table('subscription_feature', {
  id: serial().primaryKey(),
  name: varchar().notNull().unique(),
  description: text(),
  isActive: boolean().default(true),
  ...timestamps,
});

export const SubscriptionPlan = hustlSchema.table('subscription_plan', {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  description: text(),
  price: integer().notNull(),
  currency: integer().references(() => Currency.id),
  intervalUnit: IntervalUnitEnum().notNull(),
  intervalCount: integer().notNull().default(1),
  isActive: boolean().default(true),
  ...timestamps,
});

export const SubscriptionPlanFeature = hustlSchema.table(
  'subscription_plan_feature',
  {
    id: serial().primaryKey(),
    planId: integer()
      .references(() => SubscriptionPlan.id)
      .notNull(),
    featureId: integer()
      .references(() => SubscriptionFeature.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.planId, t.featureId)],
);

export const Subscription = hustlSchema.table('subscription', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => User.id)
    .notNull(),
  planId: integer()
    .references(() => SubscriptionPlan.id)
    .notNull(),
  status: SubscriptionStatusEnum().default('active'),
  expiredAt: timestamp(tzConfig).notNull(),
  ...timestamps,
});

export const Wallet = hustlSchema.table('wallet', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => User.id)
    .notNull(),
  currencyId: integer()
    .references(() => Currency.id)
    .notNull(),
  type: WalletTypeEnum().notNull().default('personal'),
  balance: integer().notNull().default(0),
  isActive: boolean().default(true),
  ...timestamps,
});

export const Brand = hustlSchema.table('brand', {
  id: serial().primaryKey(),
  name: varchar().notNull().unique(),
  description: text(),
  logo: varchar(),
  isActive: boolean().default(true),
  ...timestamps,
});

export const Category = hustlSchema.table('category', {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  description: text(),
  parentId: integer(),
  isActive: boolean().default(true),
  ...timestamps,
});

export const Size = hustlSchema.table('size', {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  value: varchar().notNull(),
  categoryId: integer().references(() => Category.id),
  isActive: boolean().default(true),
  ...timestamps,
});

export const Product = hustlSchema.table('product', {
  id: serial().primaryKey(),
  sku: varchar().notNull().unique(),
  name: varchar().notNull(),
  description: text(),
  price: integer().notNull(),
  currencyId: integer()
    .references(() => Currency.id)
    .notNull(),
  brandId: integer().references(() => Brand.id),
  categoryId: integer().references(() => Category.id),
  vendorId: integer()
    .references(() => User.id)
    .notNull(),
  images: text().array(),
  isActive: boolean().default(true),
  isFeatured: boolean().default(false),
  stockQuantity: integer().notNull().default(0),
  ...timestamps,
});

export const ProductSize = hustlSchema.table('product_size', {
  id: serial().primaryKey(),
  productId: integer()
    .references(() => Product.id)
    .notNull(),
  sizeId: integer()
    .references(() => Size.id)
    .notNull(),
  price: integer().notNull(),
  stockQuantity: integer().notNull().default(0),
  ...timestamps,
});

export const ProductReview = hustlSchema.table('product_review', {
  id: serial().primaryKey(),
  productId: integer()
    .references(() => Product.id)
    .notNull(),
  userId: integer()
    .references(() => User.id)
    .notNull(),
  rating: integer().notNull(),
  comment: text(),
  isVerified: boolean().default(false),
  ...timestamps,
});

export const Order = hustlSchema.table('order', {
  id: serial().primaryKey(),
  orderNumber: varchar().notNull().unique(),
  buyerId: integer()
    .references(() => User.id)
    .notNull(),
  vendorId: integer()
    .references(() => User.id)
    .notNull(),
  status: OrderStatusEnum().default('pending'),
  paymentStatus: PaymentStatusEnum().default('pending'),
  paymentMethod: PaymentMethodEnum(),
  subtotal: integer().notNull(),
  tax: integer().notNull().default(0),
  shipping: integer().notNull().default(0),
  total: integer().notNull(),
  currencyId: integer()
    .references(() => Currency.id)
    .notNull(),
  shippingAddress: text().notNull(),
  billingAddress: text(),
  notes: text(),
  ...timestamps,
});

export const OrderItem = hustlSchema.table('order_item', {
  id: serial().primaryKey(),
  orderId: integer()
    .references(() => Order.id)
    .notNull(),
  productId: integer()
    .references(() => Product.id)
    .notNull(),
  productSizeId: integer().references(() => ProductSize.id),
  quantity: integer().notNull(),
  unitPrice: integer().notNull(),
  totalPrice: integer().notNull(),
  ...timestamps,
});

export const UserRelations = relations(User, ({ one, many }) => ({
  otp: one(Otp),
  auth: one(Auth),
  wallets: many(Wallet),
  products: many(Product),
  services: many(UserService),
  subscriptions: many(Subscription),
  notifications: many(Notification),
  productReviews: many(ProductReview),
  notificationSetting: one(NotificationSetting),
  ordersAsBuyer: many(Order, { relationName: 'buyer' }),
  ordersAsVendor: many(Order, { relationName: 'vendor' }),
}));

export const AuthRelations = relations(Auth, ({ one }) => ({
  user: one(User, { fields: [Auth.userId], references: [User.id] }),
}));

export const ServiceRelations = relations(Service, ({ many }) => ({
  userServices: many(UserService),
}));

export const SubscriptionFeatureRelations = relations(SubscriptionFeature, ({ many }) => ({
  features: many(SubscriptionPlanFeature),
}));

export const SubscriptionPlanRelations = relations(SubscriptionPlan, ({ many, one }) => ({
  subscriptions: many(Subscription),
  features: many(SubscriptionPlanFeature),
  currency: one(Currency, { fields: [SubscriptionPlan.currency], references: [Currency.id] }),
}));

export const CurrencyRelations = relations(Currency, ({ many }) => ({
  orders: many(Order),
  wallets: many(Wallet),
  products: many(Product),
  subscriptionPlans: many(SubscriptionPlan),
}));

export const SubscriptionPlanFeatureRelations = relations(SubscriptionPlanFeature, ({ one }) => ({
  plan: one(SubscriptionPlan, { fields: [SubscriptionPlanFeature.planId], references: [SubscriptionPlan.id] }),
  feature: one(SubscriptionFeature, {
    references: [SubscriptionFeature.id],
    fields: [SubscriptionPlanFeature.featureId],
  }),
}));

export const SubscriptionRelations = relations(Subscription, ({ one }) => ({
  user: one(User, { fields: [Subscription.userId], references: [User.id] }),
  plan: one(SubscriptionPlan, { fields: [Subscription.planId], references: [SubscriptionPlan.id] }),
}));

export const UserServiceRelations = relations(UserService, ({ one }) => ({
  user: one(User, { fields: [UserService.userId], references: [User.id] }),
  service: one(Service, { fields: [UserService.serviceId], references: [Service.id] }),
}));

export const NotificationSettingRelations = relations(NotificationSetting, ({ one }) => ({
  user: one(User, { fields: [NotificationSetting.userId], references: [User.id] }),
}));

export const NotificationRelations = relations(Notification, ({ one }) => ({
  user: one(User, { fields: [Notification.userId], references: [User.id] }),
}));

export const WalletRelations = relations(Wallet, ({ one }) => ({
  user: one(User, { fields: [Wallet.userId], references: [User.id] }),
  currency: one(Currency, { fields: [Wallet.currencyId], references: [Currency.id] }),
}));

export const BrandRelations = relations(Brand, ({ many }) => ({
  products: many(Product),
}));

export const CategoryRelations = relations(Category, ({ many, one }) => ({
  sizes: many(Size),
  products: many(Product),
  parent: one(Category, { fields: [Category.parentId], references: [Category.id], relationName: 'children' }),
}));

export const SizeRelations = relations(Size, ({ many, one }) => ({
  productSizes: many(ProductSize),
  category: one(Category, { fields: [Size.categoryId], references: [Category.id] }),
}));

export const ProductRelations = relations(Product, ({ many, one }) => ({
  orderItems: many(OrderItem),
  productSizes: many(ProductSize),
  productReviews: many(ProductReview),
  brand: one(Brand, { fields: [Product.brandId], references: [Brand.id] }),
  vendor: one(User, { fields: [Product.vendorId], references: [User.id] }),
  category: one(Category, { fields: [Product.categoryId], references: [Category.id] }),
  currency: one(Currency, { fields: [Product.currencyId], references: [Currency.id] }),
}));

export const ProductSizeRelations = relations(ProductSize, ({ one, many }) => ({
  orderItems: many(OrderItem),
  size: one(Size, { fields: [ProductSize.sizeId], references: [Size.id] }),
  product: one(Product, { fields: [ProductSize.productId], references: [Product.id] }),
}));

export const ProductReviewRelations = relations(ProductReview, ({ one }) => ({
  user: one(User, { fields: [ProductReview.userId], references: [User.id] }),
  product: one(Product, { fields: [ProductReview.productId], references: [Product.id] }),
}));

export const OrderRelations = relations(Order, ({ many, one }) => ({
  orderItems: many(OrderItem),
  currency: one(Currency, { fields: [Order.currencyId], references: [Currency.id] }),
  buyer: one(User, { fields: [Order.buyerId], references: [User.id], relationName: 'buyer' }),
  vendor: one(User, { fields: [Order.vendorId], references: [User.id], relationName: 'vendor' }),
}));

export const OrderItemRelations = relations(OrderItem, ({ one }) => ({
  order: one(Order, { fields: [OrderItem.orderId], references: [Order.id] }),
  product: one(Product, { fields: [OrderItem.productId], references: [Product.id] }),
  productSize: one(ProductSize, { fields: [OrderItem.productSizeId], references: [ProductSize.id] }),
}));
