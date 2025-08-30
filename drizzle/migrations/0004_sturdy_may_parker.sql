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
ALTER TABLE "hustl"."user" DROP CONSTRAINT "user_profession_id_service_listing_id_fk";
--> statement-breakpoint
ALTER TABLE "hustl"."user_service" ADD CONSTRAINT "user_service_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user_service" ADD CONSTRAINT "user_service_service_id_service_listing_id_fk" FOREIGN KEY ("service_id") REFERENCES "hustl"."service_listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hustl"."user" DROP COLUMN "profession_id";--> statement-breakpoint
ALTER TABLE "hustl"."subscription" ADD CONSTRAINT "subscription_userId_planId_unique" UNIQUE("user_id","plan_id");--> statement-breakpoint
ALTER TABLE "hustl"."subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_planId_featureId_unique" UNIQUE("plan_id","feature_id");