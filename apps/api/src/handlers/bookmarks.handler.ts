import type { Handler } from "@app/shared/types";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookmarks, posts } from "@/db/schema";
import { requestUser } from "@/middlewares/auth.middleware";
import { errRes } from "@/utils/response";

function getSlug(req: Request): string {
	const parts = new URL(req.url).pathname.split("/");
	const idx = parts.indexOf("bookmarks");
	return idx > 0 ? (parts[idx - 1] ?? "") : "";
}

export const addBookmark: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const slug = getSlug(req);
	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (!post) return errRes(404, "Post not found");

	const [existing] = await db
		.select({ id: bookmarks.id })
		.from(bookmarks)
		.where(
			and(eq(bookmarks.postId, post.id), eq(bookmarks.profileId, user.userId)),
		);
	if (existing) return errRes(409, "Already bookmarked");

	const [bookmark] = await db
		.insert(bookmarks)
		.values({ postId: post.id, profileId: user.userId })
		.returning();
	return Response.json(bookmark, { status: 201 });
};

export const removeBookmark: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const slug = getSlug(req);
	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (!post) return errRes(404, "Post not found");

	await db
		.delete(bookmarks)
		.where(
			and(eq(bookmarks.postId, post.id), eq(bookmarks.profileId, user.userId)),
		);
	return new Response(null, { status: 204 });
};
