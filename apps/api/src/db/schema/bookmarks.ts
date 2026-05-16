import {
	bigint,
	bigserial,
	pgTable,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { profiles } from "./profiles";

export const bookmarks = pgTable(
	"bookmarks",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		postId: bigint("post_id", { mode: "number" })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		profileId: bigint("profile_id", { mode: "number" })
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => [unique().on(table.postId, table.profileId)],
);

export type Bookmark = typeof bookmarks.$inferSelect;
