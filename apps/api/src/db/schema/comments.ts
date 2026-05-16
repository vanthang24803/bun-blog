import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { bigint, bigserial, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { profiles } from "./profiles";

export const comments = pgTable("comments", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
	postId: bigint("post_id", { mode: "number" })
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	authorId: bigint("author_id", { mode: "number" })
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	parentId: bigint("parent_id", { mode: "number" }).references(
		(): AnyPgColumn => comments.id,
		{ onDelete: "set null" },
	),
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
