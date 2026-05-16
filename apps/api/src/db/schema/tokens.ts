import {
	bigint,
	bigserial,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const refreshTokens = pgTable("refresh_tokens", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	jti: uuid("jti").notNull().unique(),
	profileId: bigint("profile_id", { mode: "number" })
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});
