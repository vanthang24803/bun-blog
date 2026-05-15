import type { CreateTagInput } from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { tags } from "@/db/schema";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

export const listTags: Handler = async () => {
	const db = getDb();
	const rows = await db.select().from(tags);
	return Response.json(rows);
};

export const createTag: Handler = async (req) => {
	const db = getDb();
	const { name, slug } = getBody<CreateTagInput>(req);

	const existing = await db
		.select({ id: tags.id })
		.from(tags)
		.where(eq(tags.slug, slug));
	if (existing.length) return errRes(409, "Tag slug already exists");

	const [tag] = await db.insert(tags).values({ name, slug }).returning();
	return Response.json(tag, { status: 201 });
};
