import { bigserial, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
