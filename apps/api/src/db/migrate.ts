import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import config from "@/config";

const client = postgres(config.databaseUrl, {
	max: 1,
	idle_timeout: 30,
	ssl: "require",
});
const db = drizzle(client);

await migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations applied successfully");
await client.end({ timeout: 1 });
