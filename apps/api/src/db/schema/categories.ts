import { bigserial, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	icon: text("icon"),
	description: text("description"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
