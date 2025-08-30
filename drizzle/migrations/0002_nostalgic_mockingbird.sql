CREATE TYPE "public"."interval_unit" AS ENUM('day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "hustl"."currency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"country" text,
	"description" text,
	"code" varchar NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_name_unique" UNIQUE("name"),
	CONSTRAINT "currency_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hustl"."subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" "subscription_status" DEFAULT 'active',
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
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
	"code" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_feature_name_unique" UNIQUE("name"),
	CONSTRAINT "subscription_feature_code_unique" UNIQUE("code")
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hustl"."service" RENAME TO "service_listing";--> statement-breakpoint
ALTER TABLE "hustl"."user" RENAME COLUMN "service_id" TO "profession_id";--> statement-breakpoint
ALTER TABLE "hustl"."user" DROP CONSTRAINT "user_service_id_service_id_fk";
--> statement-breakpoint
ALTER TABLE "hustl"."subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription" ADD CONSTRAINT "subscription_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "hustl"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan" ADD CONSTRAINT "subscription_plan_currency_currency_id_fk" FOREIGN KEY ("currency") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "hustl"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_feature_id_subscription_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "hustl"."subscription_feature"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user" ADD CONSTRAINT "user_profession_id_service_listing_id_fk" FOREIGN KEY ("profession_id") REFERENCES "hustl"."service_listing"("id") ON DELETE no action ON UPDATE no action;