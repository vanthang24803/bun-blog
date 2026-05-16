import {
	bigint,
	bigserial,
	pgEnum,
	pgTable,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
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
		id: bigserial("id", { mode: "number" }).primaryKey(),
		postId: bigint("post_id", { mode: "number" })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		profileId: bigint("profile_id", { mode: "number" })
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
		id: bigserial("id", { mode: "number" }).primaryKey(),
		commentId: bigint("comment_id", { mode: "number" })
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		profileId: bigint("profile_id", { mode: "number" })
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
