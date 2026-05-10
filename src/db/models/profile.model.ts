import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
	id: uuid("id").primaryKey(),
	email: text("email").notNull().unique(),
	firstName: text("first_name").notNull().default(""),
	lastName: text("last_name").notNull().default(""),
	bio: text("bio"),
	avatar: text("avatar"),
	phone: text("phone"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
