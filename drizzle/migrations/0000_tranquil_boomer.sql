CREATE SCHEMA "hustl";
--> statement-breakpoint
CREATE TYPE "public"."interval_unit" AS ENUM('day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('PHONE_VERIFICATION', 'EMAIL_VERIFICATION', 'EMAIL_PASSWORD_RESET', 'PHONE_PASSWORD_RESET');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('wallet', 'card', 'bank_transfer', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'artisan', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('personal', 'business');--> statement-breakpoint
CREATE TABLE "hustl"."auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"password" text NOT NULL,
	"token" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "hustl"."brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"logo" varchar,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hustl"."cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_size_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"parent_id" integer,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."currency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"country" text,
	"description" text,
	"code" varchar NOT NULL,
	"logo" varchar,
	"symbol" varchar,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_name_unique" UNIQUE("name"),
	CONSTRAINT "currency_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hustl"."notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"type" varchar NOT NULL,
	"is_read" boolean DEFAULT false,
	"user_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."notification_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"map" boolean DEFAULT false,
	"chat" boolean DEFAULT false,
	"email" boolean DEFAULT false,
	"phone" boolean DEFAULT false,
	"order" boolean DEFAULT false,
	"user_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar NOT NULL,
	"buyer_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending',
	"payment_status" "payment_status" DEFAULT 'pending',
	"payment_method" "payment_method",
	"subtotal" integer NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"shipping" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"shipping_address" text NOT NULL,
	"billing_address" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_orderNumber_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "hustl"."order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_size_id" integer,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"total_price" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar,
	"type" "otp_type",
	"identifier" varchar,
	"expired_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hustl"."product" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"brand_id" integer,
	"category_id" integer,
	"store_id" integer NOT NULL,
	"images" text[],
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "hustl"."product_review" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."product_size" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"size_id" integer NOT NULL,
	"price" integer NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."service_listing" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."size" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"value" varchar NOT NULL,
	"category_id" integer,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."store" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"address" text,
	"phone" varchar,
	"is_online" boolean DEFAULT true,
	"business_hours" text,
	"availability" jsonb,
	"offer_delivery_service" boolean DEFAULT false,
	"delivery_radius" integer DEFAULT 0,
	"delivery_fee" integer DEFAULT 0,
	"bank_name" varchar,
	"account_number" varchar,
	"account_name" varchar,
	"payout_schedule" varchar DEFAULT 'weekly',
	"owner_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" "subscription_status" DEFAULT 'active',
	"expired_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."subscription_feature" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_feature_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hustl"."subscription_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" integer,
	"interval_unit" interval_unit NOT NULL,
	"interval_count" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."subscription_plan_feature" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"feature_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plan_feature_planId_featureId_unique" UNIQUE("plan_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "hustl"."user" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'artisan' NOT NULL,
	"bio" varchar,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"avatar" varchar,
	"address" varchar,
	"city" varchar,
	"state" varchar,
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "hustl"."user_service" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_service_userId_serviceId_unique" UNIQUE("user_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "hustl"."wallet" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"type" "wallet_type" DEFAULT 'personal' NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hustl"."auth" ADD CONSTRAINT "auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "hustl"."cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "hustl"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_product_size_id_product_size_id_fk" FOREIGN KEY ("product_size_id") REFERENCES "hustl"."product_size"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."notification_setting" ADD CONSTRAINT "notification_setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD CONSTRAINT "order_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "hustl"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD CONSTRAINT "order_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "hustl"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "hustl"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD CONSTRAINT "order_item_product_size_id_product_size_id_fk" FOREIGN KEY ("product_size_id") REFERENCES "hustl"."product_size"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD CONSTRAINT "product_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "hustl"."brand"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "hustl"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD CONSTRAINT "product_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "hustl"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "hustl"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product_review" ADD CONSTRAINT "product_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product_size" ADD CONSTRAINT "product_size_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "hustl"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product_size" ADD CONSTRAINT "product_size_size_id_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "hustl"."size"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."size" ADD CONSTRAINT "size_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "hustl"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."store" ADD CONSTRAINT "store_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription" ADD CONSTRAINT "subscription_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "hustl"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan" ADD CONSTRAINT "subscription_plan_currency_currency_id_fk" FOREIGN KEY ("currency") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "hustl"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_feature_id_subscription_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "hustl"."subscription_feature"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user_service" ADD CONSTRAINT "user_service_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user_service" ADD CONSTRAINT "user_service_service_id_service_listing_id_fk" FOREIGN KEY ("service_id") REFERENCES "hustl"."service_listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."wallet" ADD CONSTRAINT "wallet_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;