import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { profiles } from "./profiles";

export const comments = pgTable("comments", {
	id: uuid("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
	postId: uuid("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	authorId: uuid("author_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
		onDelete: "set null",
	}),
	content: text("content").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
