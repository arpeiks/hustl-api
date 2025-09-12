CREATE TABLE "hustl"."payment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"payment_provider" varchar NOT NULL,
	"payment_method" varchar NOT NULL,
	"amount" integer NOT NULL,
	"currency_id" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending',
	"external_transaction_id" varchar,
	"external_reference" varchar,
	"gateway_response" jsonb,
	"fees" integer DEFAULT 0,
	"net_amount" integer NOT NULL,
	"is_escrow" boolean DEFAULT false,
	"escrow_released_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"refund_amount" integer DEFAULT 0,
	"refund_reason" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."shipping_method" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"estimated_days" varchar,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_method_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "shipping_method_id" integer;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "name" varchar;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "processing_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "dispatched_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD COLUMN "refunded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hustl"."payment_details" ADD CONSTRAINT "payment_details_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "hustl"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."payment_details" ADD CONSTRAINT "payment_details_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" ADD CONSTRAINT "order_shipping_method_id_shipping_method_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "hustl"."shipping_method"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."order" DROP COLUMN "payment_method";--> statement-breakpoint
DROP TYPE "public"."payment_method";