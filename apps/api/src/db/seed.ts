import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, tags } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

const client = postgres(DATABASE_URL, {
	prepare: false,
	max: 1,
	ssl: "require",
	connection: { statement_timeout: 30_000 },
});
const db = drizzle(client);

const CATEGORIES = [
	{ name: "Travel",    slug: "travel",    icon: "✈️",  description: "Adventures, destinations, and travel tips from around the world" },
	{ name: "Work",      slug: "work",      icon: "💼",  description: "Productivity, career growth, and workplace insights" },
	{ name: "Software",  slug: "software",  icon: "💻",  description: "Engineering, architecture, and software development" },
	{ name: "Design",    slug: "design",    icon: "🎨",  description: "UI/UX, visual design, and creative process" },
	{ name: "Health",    slug: "health",    icon: "❤️",  description: "Wellness, fitness, and mental health" },
	{ name: "Food",      slug: "food",      icon: "🍴",  description: "Recipes, restaurants, and culinary adventures" },
	{ name: "Finance",   slug: "finance",   icon: "💰",  description: "Personal finance, investing, and money management" },
	{ name: "Education", slug: "education", icon: "📚",  description: "Learning, courses, and knowledge sharing" },
	{ name: "Other",     slug: "other",     icon: "📦",  description: "Everything else worth writing about" },
];

const TAGS = [
	// Travel
	{ name: "Backpacking", slug: "backpacking" },
	{ name: "Solo travel", slug: "solo-travel" },
	{ name: "Road trip", slug: "road-trip" },
	{ name: "Budget travel", slug: "budget-travel" },
	{ name: "Asia", slug: "asia" },
	{ name: "Europe", slug: "europe" },
	// Work
	{ name: "Remote work", slug: "remote-work" },
	{ name: "Productivity", slug: "productivity" },
	{ name: "Career", slug: "career" },
	{ name: "Leadership", slug: "leadership" },
	{ name: "Freelancing", slug: "freelancing" },
	// Software
	{ name: "TypeScript", slug: "typescript" },
	{ name: "Vue.js", slug: "vuejs" },
	{ name: "React", slug: "react" },
	{ name: "Bun", slug: "bun" },
	{ name: "PostgreSQL", slug: "postgresql" },
	{ name: "Open source", slug: "open-source" },
	{ name: "DevOps", slug: "devops" },
	{ name: "AI", slug: "ai" },
	// Design
	{ name: "UI design", slug: "ui-design" },
	{ name: "UX research", slug: "ux-research" },
	{ name: "Figma", slug: "figma" },
	// Health
	{ name: "Running", slug: "running" },
	{ name: "Meditation", slug: "meditation" },
	{ name: "Nutrition", slug: "nutrition" },
	// Food
	{ name: "Vietnamese cuisine", slug: "vietnamese-cuisine" },
	{ name: "Vegetarian", slug: "vegetarian" },
	{ name: "Recipes", slug: "recipes" },
	// Finance
	{ name: "Investing", slug: "investing" },
	{ name: "Savings", slug: "savings" },
	// General
	{ name: "Tutorial", slug: "tutorial" },
	{ name: "Opinion", slug: "opinion" },
	{ name: "Review", slug: "review" },
	{ name: "News", slug: "news" },
];

async function seed() {
	const now = new Date();

	console.log("Seeding categories...");
	await db
		.insert(categories)
		.values(CATEGORIES.map((c) => ({ ...c, updatedAt: now })))
		.onConflictDoUpdate({
			target: categories.slug,
			set: {
				icon: sql`excluded.icon`,
				description: sql`excluded.description`,
				updatedAt: now,
			},
		});
	console.log(`  ✓ ${CATEGORIES.length} categories`);

	console.log("Seeding tags...");
	await db
		.insert(tags)
		.values(TAGS)
		.onConflictDoNothing({ target: tags.slug });
	console.log(`  ✓ ${TAGS.length} tags`);

	console.log("\nDone.");
	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
