CREATE TYPE "public"."wallet_type" AS ENUM('personal', 'business');--> statement-breakpoint
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
ALTER TABLE "hustl"."wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."wallet" ADD CONSTRAINT "wallet_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "hustl"."currency"("id") ON DELETE no action ON UPDATE no action;