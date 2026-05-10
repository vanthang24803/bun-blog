import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import config from "@/config";

const client = new SQL({ url: config.databaseUrl, prepare: false });
const db = drizzle(client);

await migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations applied successfully");
process.exit(0);
