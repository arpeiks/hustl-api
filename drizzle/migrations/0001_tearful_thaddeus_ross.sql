ALTER TABLE "hustl"."category" ADD CONSTRAINT "category_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "hustl"."product_size" ADD CONSTRAINT "product_size_productId_sizeId_unique" UNIQUE("product_id","size_id");--> statement-breakpoint
ALTER TABLE "hustl"."service_listing" ADD CONSTRAINT "service_listing_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "hustl"."size" ADD CONSTRAINT "size_name_value_categoryId_unique" UNIQUE("name","value","category_id");--> statement-breakpoint
ALTER TABLE "hustl"."store" ADD CONSTRAINT "store_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan" ADD CONSTRAINT "subscription_plan_name_currency_unique" UNIQUE("name","currency");--> statement-breakpoint
ALTER TABLE "hustl"."wallet" ADD CONSTRAINT "wallet_userId_currencyId_type_unique" UNIQUE("user_id","currency_id","type");