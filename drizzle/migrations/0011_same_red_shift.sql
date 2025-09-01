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
ALTER TABLE "hustl"."notification_setting" ADD CONSTRAINT "notification_setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "hustl"."user"("id") ON DELETE no action ON UPDATE no action;