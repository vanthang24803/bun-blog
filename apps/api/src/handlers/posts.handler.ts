import type {
	CreatePostInput,
	UpdatePostInput,
} from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { ALLOWED_TYPES, MAX_SIZE } from "@app/shared/constants";
import { and, eq, inArray, sql } from "drizzle-orm";
import config from "@/config";
import { getDb } from "@/db";
import { bookmarks, postReactions, posts, postTags, tags } from "@/db/schema";
import { s3 } from "@/lib/s3";
import { requestUser } from "@/middlewares/auth.middleware";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

function parseIntParam(val: string | null, fallback: number): number {
	const n = Number(val);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const uploadPostCover: Handler = async (req) => {
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	let formData: globalThis.FormData;
	try {
		formData = (await req.formData()) as globalThis.FormData;
	} catch {
		return errRes(400, "Request must be multipart/form-data");
	}

	const file = formData.get("cover");
	if (!file || !(file instanceof File))
		return errRes(400, "cover field is required");

	const ext = ALLOWED_TYPES[file.type];
	if (!ext) return errRes(400, "cover must be jpeg, png, webp or gif");
	if (file.size > MAX_SIZE)
		return errRes(400, "cover must be smaller than 5 MB");

	const key = `covers/${user.userId}/${crypto.randomUUID()}.${ext}`;
	await s3.write(key, await file.arrayBuffer(), { type: file.type });

	return Response.json({
		url: `${config.storageBaseUrl}/${config.s3.bucket}/${key}`,
	});
};

export const listPosts: Handler = async (req) => {
	const db = getDb();
	const url = new URL(req.url);
	const limit = Math.min(parseIntParam(url.searchParams.get("limit"), 20), 100);
	const offset = parseIntParam(url.searchParams.get("offset"), 0) - 1;
	const categoryId = url.searchParams.get("categoryId");
	const tagId = url.searchParams.get("tagId");
	const mine = url.searchParams.get("mine") === "1";
	const user = requestUser.get(req);

	const conditions = [];
	if (mine) {
		if (!user) return errRes(401, "Unauthorized");
		conditions.push(eq(posts.authorId, user.userId));
	} else {
		conditions.push(eq(posts.status, "published"));
	}
	if (categoryId) conditions.push(eq(posts.categoryId, Number(categoryId)));

	let query = db
		.select()
		.from(posts)
		.where(and(...conditions))
		.limit(limit)
		.offset(Math.max(offset, 0));

	if (tagId) {
		const postIdsWithTag = db
			.select({ postId: postTags.postId })
			.from(postTags)
			.where(eq(postTags.tagId, Number(tagId)));
		query = db
			.select()
			.from(posts)
			.where(and(...conditions, inArray(posts.id, postIdsWithTag)))
			.limit(limit)
			.offset(Math.max(offset, 0));
	}

	const rows = await query;
	return Response.json(rows);
};

export const getPost: Handler = async (req) => {
	const db = getDb();
	const slug = new URL(req.url).pathname.split("/").pop() ?? "";
	const user = requestUser.get(req);

	const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
	if (!post || post.status !== "published")
		if (!post || post.authorId !== user?.userId)
			return errRes(404, "Post not found");

	const postTagRows = await db
		.select({ tag: tags })
		.from(postTags)
		.innerJoin(tags, eq(postTags.tagId, tags.id))
		.where(eq(postTags.postId, post.id));

	const reactionCount = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(postReactions)
		.where(eq(postReactions.postId, post.id));

	return Response.json({
		...post,
		tags: postTagRows.map((r) => r.tag),
		reactionCount: reactionCount[0]?.count ?? 0,
	});
};

export const createPost: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const {
		title,
		slug,
		content,
		excerpt,
		coverImage,
		categoryId,
		tagIds,
		status,
	} = getBody<CreatePostInput>(req);

	const existing = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.slug, slug));
	if (existing.length) return errRes(409, "Post slug already exists");

	const publishedAt = status === "published" ? new Date() : null;

	const [post] = await db
		.insert(posts)
		.values({
			authorId: user.userId,
			title,
			slug,
			content,
			excerpt,
			coverImage,
			categoryId,
			status,
			publishedAt: publishedAt ?? undefined,
		})
		.returning();

	if (!post) return errRes(500, "Failed to create post");

	if (tagIds?.length) {
		await db
			.insert(postTags)
			.values(tagIds.map((tagId) => ({ postId: post.id, tagId })));
	}

	return Response.json(post, { status: 201 });
};

export const updatePost: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const publicId = new URL(req.url).pathname.split("/").pop() ?? "";
	if (!publicId) {
		return errRes(400, "Invalid post public id");
	}

	const [existing] = await db
		.select()
		.from(posts)
		.where(eq(posts.publicId, publicId));
	if (!existing) return errRes(404, "Post not found");
	if (existing.authorId !== user.userId) return errRes(403, "Forbidden");

	const {
		title,
		slug: newSlug,
		content,
		excerpt,
		coverImage,
		categoryId,
		tagIds,
		status,
	} = getBody<UpdatePostInput>(req);

	const patch: Partial<typeof posts.$inferInsert> = {};
	if (title !== undefined) patch.title = title;
	if (newSlug !== undefined) patch.slug = newSlug;
	if (content !== undefined) patch.content = content;
	if (excerpt !== undefined) patch.excerpt = excerpt;
	if (coverImage !== undefined) patch.coverImage = coverImage;
	if (categoryId !== undefined) patch.categoryId = categoryId;
	if (status !== undefined) {
		patch.status = status;
		if (status === "published" && !existing.publishedAt) {
			patch.publishedAt = new Date();
		}
	}

	const [updated] = await db
		.update(posts)
		.set(patch)
		.where(eq(posts.id, existing.id))
		.returning();

	if (tagIds !== undefined) {
		await db.delete(postTags).where(eq(postTags.postId, existing.id));
		if (tagIds.length) {
			await db
				.insert(postTags)
				.values(tagIds.map((tagId) => ({ postId: existing.id, tagId })));
		}
	}

	return Response.json(updated);
};

export const deletePost: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const slug = new URL(req.url).pathname.split("/").pop() ?? "";
	const [existing] = await db.select().from(posts).where(eq(posts.slug, slug));
	if (!existing) return errRes(404, "Post not found");
	if (existing.authorId !== user.userId) return errRes(403, "Forbidden");

	await db.delete(posts).where(eq(posts.id, existing.id));
	return new Response(null, { status: 204 });
};

export const listMyBookmarks: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const rows = await db
		.select({ post: posts })
		.from(bookmarks)
		.innerJoin(posts, eq(bookmarks.postId, posts.id))
		.where(eq(bookmarks.profileId, user.userId));

	return Response.json(rows.map((r) => r.post));
};
