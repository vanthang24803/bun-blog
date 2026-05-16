import { bigserial, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
