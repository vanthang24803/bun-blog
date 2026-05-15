import { pgEnum, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { comments } from "./comments";
import { posts } from "./posts";
import { profiles } from "./profiles";

export const reactionTypeEnum = pgEnum("reaction_type", [
	"like",
	"love",
	"insightful",
]);

export const postReactions = pgTable(
	"post_reactions",
	{
		id: uuid("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		type: reactionTypeEnum("type").notNull().default("like"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => [unique().on(table.postId, table.profileId)],
);

export const commentReactions = pgTable(
	"comment_reactions",
	{
		id: uuid("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		commentId: uuid("comment_id")
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		type: reactionTypeEnum("type").notNull().default("like"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => [unique().on(table.commentId, table.profileId)],
);

export type PostReaction = typeof postReactions.$inferSelect;
export type CommentReaction = typeof commentReactions.$inferSelect;
