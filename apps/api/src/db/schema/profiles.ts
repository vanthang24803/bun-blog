import { bigint, bigserial, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const profiles = pgTable("profiles", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	userId: bigint("user_id", { mode: "number" })
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
	publicId: uuid("public_id")
		.notNull()
		.unique()
		.$defaultFn(() => Bun.randomUUIDv7()),
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
