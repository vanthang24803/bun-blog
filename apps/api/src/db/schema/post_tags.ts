import { bigint, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { tags } from "./tags";

export const postTags = pgTable(
	"post_tags",
	{
		postId: bigint("post_id", { mode: "number" })
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		tagId: bigint("tag_id", { mode: "number" })
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);
