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

export type TAuth = typeof Auth.$inferSelect;
export type TService = typeof Service.$inferSelect;
export type TCurrency = typeof Currency.$inferSelect;
export type TUserService = typeof UserService.$inferSelect;
export type TSubscription = typeof Subscription.$inferSelect;
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

export const UserRelations = relations(User, ({ one, many }) => ({
  otp: one(Otp),
  auth: one(Auth),
  services: many(UserService),
  subscriptions: many(Subscription),
  notificationSetting: one(NotificationSetting),
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
