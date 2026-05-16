import type { CreateReactionInput } from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { commentReactions, comments, postReactions, posts } from "@/db/schema";
import { requestUser } from "@/middlewares/auth.middleware";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

function getSlug(req: Request): string {
	const parts = new URL(req.url).pathname.split("/");
	const idx = parts.indexOf("reactions");
	return idx > 0 ? (parts[idx - 1] ?? "") : "";
}

function getCommentId(req: Request): string {
	const parts = new URL(req.url).pathname.split("/");
	const idx = parts.indexOf("reactions");
	return idx > 0 ? (parts[idx - 1] ?? "") : "";
}

export const reactToPost: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const slug = getSlug(req);
	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (!post) return errRes(404, "Post not found");

	const { type } = getBody<CreateReactionInput>(req);

	const [existing] = await db
		.select()
		.from(postReactions)
		.where(
			and(
				eq(postReactions.postId, post.id),
				eq(postReactions.profileId, user.userId),
			),
		);

	if (existing) {
		const [updated] = await db
			.update(postReactions)
			.set({ type })
			.where(eq(postReactions.id, existing.id))
			.returning();
		return Response.json(updated);
	}

	const [reaction] = await db
		.insert(postReactions)
		.values({ postId: post.id, profileId: user.userId, type })
		.returning();
	return Response.json(reaction, { status: 201 });
};

export const removePostReaction: Handler = async (req) => {
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
		.delete(postReactions)
		.where(
			and(
				eq(postReactions.postId, post.id),
				eq(postReactions.profileId, user.userId),
			),
		);
	return new Response(null, { status: 204 });
};

export const reactToComment: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const commentId = getCommentId(req);
	const [comment] = await db
		.select({ id: comments.id })
		.from(comments)
		.where(eq(comments.id, Number(commentId)));
	if (!comment) return errRes(404, "Comment not found");

	const { type } = getBody<CreateReactionInput>(req);

	const [existing] = await db
		.select()
		.from(commentReactions)
		.where(
			and(
				eq(commentReactions.commentId, comment.id),
				eq(commentReactions.profileId, user.userId),
			),
		);

	if (existing) {
		const [updated] = await db
			.update(commentReactions)
			.set({ type })
			.where(eq(commentReactions.id, existing.id))
			.returning();
		return Response.json(updated);
	}

	const [reaction] = await db
		.insert(commentReactions)
		.values({ commentId: comment.id, profileId: user.userId, type })
		.returning();
	return Response.json(reaction, { status: 201 });
};

export const removeCommentReaction: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const commentId = getCommentId(req);
	const [comment] = await db
		.select({ id: comments.id })
		.from(comments)
		.where(eq(comments.id, Number(commentId)));
	if (!comment) return errRes(404, "Comment not found");

	await db
		.delete(commentReactions)
		.where(
			and(
				eq(commentReactions.commentId, comment.id),
				eq(commentReactions.profileId, user.userId),
			),
		);
	return new Response(null, { status: 204 });
};
