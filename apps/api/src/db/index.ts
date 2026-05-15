import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import config from "@/config";
import * as schema from "./schema";

// prepare: false is required for Supabase's transaction-mode pooler (port 6543).
// max: 1 keeps the pool simple for transaction mode and reduces stale connection churn.
const opts = {
	prepare: false,
	max: 1,
	idle_timeout: 30,
	ssl: "require",
} as const;

let sqlInstance = createClient();

function createClient(): Sql {
	return postgres(config.databaseUrl, opts);
}

// Exported as a live binding so resetDb() is visible to all importers
export let db = drizzle(sqlInstance, { schema });

export function getDb() {
	return db;
}

// Drain and close the old pool first, then create a fresh one.
// Closing first ensures the old TCP connection is gone before the new pool dials out,
// preventing the old #onClose event from bleeding into the new pool's pending query.
export async function resetDb() {
	const old = sqlInstance;
	try {
		await old.end({ timeout: 1 });
	} catch {
		// already closed — nothing to do
	}
	sqlInstance = createClient();
	db = drizzle(sqlInstance, { schema });
}

export function isConnectionError(e: unknown): boolean {
	let current: unknown = e;
	while (current && typeof current === "object") {
		const code = (current as { code?: string }).code;
		const message = (current as { message?: string }).message;

		if (
			code === "ERR_POSTGRES_CONNECTION_CLOSED" ||
			message === "Connection closed"
		) {
			return true;
		}

		current = (current as { cause?: unknown }).cause;
	}
	return false;
}
