import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { profiles } from "./profiles";

export const bookmarks = pgTable(
	"bookmarks",
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
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => [unique().on(table.postId, table.profileId)],
);

export type Bookmark = typeof bookmarks.$inferSelect;
