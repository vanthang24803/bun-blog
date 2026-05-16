CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
INSERT INTO "users" ("id", "email", "password_hash", "created_at", "updated_at")
SELECT "id", "email", "password_hash", "created_at", "updated_at" FROM "profiles";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_email_unique";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "password_hash";
