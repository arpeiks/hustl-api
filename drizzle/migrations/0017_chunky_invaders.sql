ALTER TABLE "hustl"."order" DROP CONSTRAINT "order_vendor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "hustl"."product" DROP CONSTRAINT "product_vendor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "store_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD COLUMN "store_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "hustl"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."product" ADD CONSTRAINT "product_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "hustl"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" DROP COLUMN "vendor_id";--> statement-breakpoint
ALTER TABLE "hustl"."product" DROP COLUMN "vendor_id";