import { relations } from 'drizzle-orm';
import { text, serial, pgEnum, varchar, integer, pgSchema, timestamp, PgTimestampConfig } from 'drizzle-orm/pg-core';

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
export type TRole = (typeof RoleEnum.enumValues)[number];
export const RoleEnum = pgEnum('role', RoleMap);

export type TAuth = typeof Auth.$inferSelect;
export type TUser = typeof User.$inferSelect & { auth?: TAuth };

export const User = hustlSchema.table('user', {
  id: serial().primaryKey(),
  role: RoleEnum().notNull().default('artisan'),
  fullName: varchar().notNull(),
  email: varchar().unique().notNull(),
  phone: varchar().unique().notNull(),
  serviceId: integer().references(() => Service.id),
  avatar: varchar(),
  address: varchar(),
  city: varchar(),
  state: varchar(),
  emailVerifiedAt: timestamp(tzConfig),
  phoneVerifiedAt: timestamp(tzConfig),
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

export const Service = hustlSchema.table('service', {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  description: text(),
  ...timestamps,
});

export const UserRelations = relations(User, ({ one }) => ({
  otp: one(Otp),
  auth: one(Auth),
  service: one(Service),
}));

export const AuthRelations = relations(Auth, ({ one }) => ({
  user: one(User, { fields: [Auth.userId], references: [User.id] }),
}));

export const ServiceRelations = relations(Service, ({ many }) => ({
  users: many(User),
}));
