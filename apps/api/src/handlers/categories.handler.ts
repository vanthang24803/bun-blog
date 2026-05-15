import type { CreateCategoryInput } from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

export const listCategories: Handler = async () => {
	const db = getDb();
	const rows = await db.select().from(categories);
	return Response.json(rows);
};

export const createCategory: Handler = async (req) => {
	const db = getDb();
	const { name, slug, description } = getBody<CreateCategoryInput>(req);

	const existing = await db
		.select({ id: categories.id })
		.from(categories)
		.where(eq(categories.slug, slug));
	if (existing.length) return errRes(409, "Category slug already exists");

	const [category] = await db
		.insert(categories)
		.values({ name, slug, description })
		.returning();
	return Response.json(category, { status: 201 });
};
