import { relations } from 'drizzle-orm';
import { text, serial, pgEnum, varchar, integer, pgSchema, timestamp, PgTimestampConfig } from 'drizzle-orm/pg-core';

export const hustlSchema = pgSchema('hustl');

const tzConfig: PgTimestampConfig = { withTimezone: true };

const timestamps = {
  deletedAt: timestamp(tzConfig),
  createdAt: timestamp(tzConfig).defaultNow().notNull(),
  updatedAt: timestamp(tzConfig).defaultNow().notNull(),
};

export const OtpTypeMap = ['PHONE_VERIFICATION'] as const;
export const OtpTypeEnum = pgEnum('otp_type', OtpTypeMap);
export type TOtpType = (typeof OtpTypeEnum.enumValues)[number];

export const RoleMap = ['user', 'artisan'] as const;
export type TRole = (typeof RoleEnum.enumValues)[number];
export const RoleEnum = pgEnum('role', RoleMap);

export const User = hustlSchema.table('user', {
  id: serial().primaryKey(),
  role: RoleEnum().notNull().default('artisan'),
  fullName: varchar().notNull(),
  email: varchar().unique().notNull(),
  phone: varchar().unique().notNull(),
  niche: varchar(),
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
  userId: integer('user_id')
    .unique()
    .references(() => User.id),
  expiredAt: timestamp('expired_at', tzConfig).defaultNow(),
  createdAt: timestamp('created_at', tzConfig).defaultNow(),
  updatedAt: timestamp('updated_at', tzConfig).defaultNow(),
});

export const UserRelations = relations(User, ({ one }) => ({
  otp: one(Otp),
  auth: one(Auth),
}));

export const AuthRelations = relations(Auth, ({ one }) => ({
  user: one(User, { fields: [Auth.userId], references: [User.id] }),
}));

export const OtpRelations = relations(Otp, ({ one }) => ({
  user: one(User, { fields: [Otp.userId], references: [User.id] }),
}));
