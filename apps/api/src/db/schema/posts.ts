import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { profiles } from "./profiles";

export const postStatusEnum = pgEnum("post_status", [
	"draft",
	"published",
	"archived",
]);

export const posts = pgTable("posts", {
	id: uuid("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
	authorId: uuid("author_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	categoryId: uuid("category_id").references(() => categories.id, {
		onDelete: "set null",
	}),
	title: text("title").notNull(),
	slug: text("slug").notNull().unique(),
	content: text("content").notNull(),
	excerpt: text("excerpt"),
	coverImage: text("cover_image"),
	status: postStatusEnum("status").notNull().default("draft"),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
