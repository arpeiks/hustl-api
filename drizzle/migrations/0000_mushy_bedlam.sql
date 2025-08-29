CREATE SCHEMA "hustl";
--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('PHONE_VERIFICATION');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'artisan', 'admin');--> statement-breakpoint
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
CREATE TABLE "hustl"."service" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hustl"."user" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'artisan' NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"service_id" integer,
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
ALTER TABLE "hustl"."auth" ADD CONSTRAINT "auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user" ADD CONSTRAINT "user_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "hustl"."service"("id") ON DELETE no action ON UPDATE no action;