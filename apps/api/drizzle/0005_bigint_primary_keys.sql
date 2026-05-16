-- Drop all application tables (CASCADE handles FK dependencies)
DROP TABLE IF EXISTS "post_tags" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "bookmarks" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "post_reactions" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "comment_reactions" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "refresh_tokens" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "comments" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "posts" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "profiles" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "categories" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "tags" CASCADE;
--> statement-breakpoint

-- Recreate all tables with bigint auto-increment PKs
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"public_id" uuid NOT NULL,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"bio" text,
	"avatar" text,
	"phone" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "categories_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "tags_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"author_id" bigint NOT NULL,
	"category_id" bigint,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"cover_image" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "posts_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid NOT NULL,
	"post_id" bigint NOT NULL,
	"author_id" bigint NOT NULL,
	"parent_id" bigint,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "comments_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"jti" uuid NOT NULL,
	"profile_id" bigint NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "refresh_tokens_jti_unique" UNIQUE("jti")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" bigint NOT NULL,
	"tag_id" bigint NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"post_id" bigint NOT NULL,
	"profile_id" bigint NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"post_id" bigint NOT NULL,
	"profile_id" bigint NOT NULL,
	"type" "reaction_type" DEFAULT 'like' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"comment_id" bigint NOT NULL,
	"profile_id" bigint NOT NULL,
	"type" "reaction_type" DEFAULT 'like' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint

-- Foreign key constraints
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Unique constraints for junction/reaction tables
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_post_id_profile_id_unique" UNIQUE("post_id","profile_id");
--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_profile_id_unique" UNIQUE("post_id","profile_id");
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_profile_id_unique" UNIQUE("comment_id","profile_id");
