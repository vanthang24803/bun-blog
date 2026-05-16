import type {
	CreateCommentInput,
	UpdateCommentInput,
} from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { comments, posts, profiles, users } from "@/db/schema";
import { requestUser } from "@/middlewares/auth.middleware";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

const commentWithAuthor = {
	id: comments.id,
	publicId: comments.publicId,
	postId: comments.postId,
	authorId: comments.authorId,
	parentId: comments.parentId,
	content: comments.content,
	createdAt: comments.createdAt,
	updatedAt: comments.updatedAt,
	authorFirstName: profiles.firstName,
	authorLastName: profiles.lastName,
	authorAvatar: profiles.avatar,
	authorEmail: users.email,
};

function getSlug(req: Request): string {
	const parts = new URL(req.url).pathname.split("/");
	const commentsIdx = parts.indexOf("comments");
	return commentsIdx > 0 ? (parts[commentsIdx - 1] ?? "") : "";
}

function getCommentId(req: Request): string {
	return new URL(req.url).pathname.split("/").pop() ?? "";
}

export const listComments: Handler = async (req) => {
	const db = getDb();
	const slug = getSlug(req);

	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (!post) return errRes(404, "Post not found");

	// top-level comments only; client fetches replies separately
	const rows = await db
		.select(commentWithAuthor)
		.from(comments)
		.leftJoin(profiles, eq(profiles.id, comments.authorId))
		.leftJoin(users, eq(users.id, profiles.userId))
		.where(and(eq(comments.postId, post.id), isNull(comments.parentId)));

	return Response.json(rows);
};

export const listReplies: Handler = async (req) => {
	const db = getDb();
	const commentId = getCommentId(req);

	const [parent] = await db
		.select({ id: comments.id })
		.from(comments)
		.where(eq(comments.id, Number(commentId)));
	if (!parent) return errRes(404, "Comment not found");

	const rows = await db
		.select(commentWithAuthor)
		.from(comments)
		.leftJoin(profiles, eq(profiles.id, comments.authorId))
		.leftJoin(users, eq(users.id, profiles.userId))
		.where(eq(comments.parentId, Number(commentId)));

	return Response.json(rows);
};

export const createComment: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const slug = getSlug(req);
	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (!post) return errRes(404, "Post not found");

	const { content, parentId } = getBody<CreateCommentInput>(req);

	if (parentId) {
		const [parent] = await db
			.select({ id: comments.id, postId: comments.postId })
			.from(comments)
			.where(eq(comments.id, parentId));
		if (!parent || parent.postId !== post.id)
			return errRes(404, "Parent comment not found");
	}

	const [inserted] = await db
		.insert(comments)
		.values({ postId: post.id, authorId: user.userId, content, parentId })
		.returning({ id: comments.id });

	const [comment] = await db
		.select(commentWithAuthor)
		.from(comments)
		.leftJoin(profiles, eq(profiles.id, comments.authorId))
		.leftJoin(users, eq(users.id, profiles.userId))
		.where(eq(comments.id, inserted.id));

	return Response.json(comment, { status: 201 });
};

export const updateComment: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const commentId = getCommentId(req);
	const [existing] = await db
		.select()
		.from(comments)
		.where(eq(comments.id, Number(commentId)));
	if (!existing) return errRes(404, "Comment not found");
	if (existing.authorId !== user.userId) return errRes(403, "Forbidden");

	const { content } = getBody<UpdateCommentInput>(req);
	await db
		.update(comments)
		.set({ content })
		.where(eq(comments.id, Number(commentId)));

	const [updated] = await db
		.select(commentWithAuthor)
		.from(comments)
		.leftJoin(profiles, eq(profiles.id, comments.authorId))
		.leftJoin(users, eq(users.id, profiles.userId))
		.where(eq(comments.id, Number(commentId)));

	return Response.json(updated);
};

export const deleteComment: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const commentId = getCommentId(req);
	const [existing] = await db
		.select()
		.from(comments)
		.where(eq(comments.id, Number(commentId)));
	if (!existing) return errRes(404, "Comment not found");
	if (existing.authorId !== user.userId) return errRes(403, "Forbidden");

	await db.delete(comments).where(eq(comments.id, Number(commentId)));
	return new Response(null, { status: 204 });
};
