CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'shipped', 'refunded', 'confirmed', 'delivered', 'cancelled', 'processing');--> statement-breakpoint
ALTER TABLE "hustl"."order" DROP CONSTRAINT "order_store_id_store_id_fk";
--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "is_multi_vendor" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "status" "order_item_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "processing_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "shipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order_item" ADD COLUMN "refunded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" DROP COLUMN "store_id";