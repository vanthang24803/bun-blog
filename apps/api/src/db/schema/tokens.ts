import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid("id").primaryKey(),
	profileId: uuid("profile_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});
