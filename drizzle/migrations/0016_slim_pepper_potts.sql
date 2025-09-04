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
CREATE TABLE "hustl"."store" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"address" text,
	"phone" varchar,
	"is_online" boolean DEFAULT true,
	"business_hours" text,
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
ALTER TABLE "hustl"."cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "hustl"."cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "hustl"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."cart_item" ADD CONSTRAINT "cart_item_product_size_id_product_size_id_fk" FOREIGN KEY ("product_size_id") REFERENCES "hustl"."product_size"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."store" ADD CONSTRAINT "store_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;