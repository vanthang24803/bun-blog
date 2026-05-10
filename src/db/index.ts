import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import config from "@/config";
import * as schema from "./schema";

// prepare: false is required for Supabase's transaction-mode PgBouncer (port 6543)
const client = new SQL({ url: config.databaseUrl, prepare: false });

export const db = drizzle(client, { schema });
