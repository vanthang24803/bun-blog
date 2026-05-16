import { ALLOWED_TYPES, MAX_SIZE } from "@app/shared/constants";
import type {
	CreatePostInput,
	UpdatePostInput,
} from "@app/shared/schemas/blog.schema";
import type { Handler } from "@app/shared/types";
import { and, eq, inArray, sql } from "drizzle-orm";
import config from "@/config";
import { getDb } from "@/db";
import {
	bookmarks,
	comments,
	postReactions,
	posts,
	postTags,
	profiles,
	tags,
} from "@/db/schema";
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
	if (tagId) {
		const postIdsWithTag = db
			.select({ postId: postTags.postId })
			.from(postTags)
			.where(eq(postTags.tagId, Number(tagId)));
		conditions.push(inArray(posts.id, postIdsWithTag));
	}

	const rows = await db
		.select({
			id: posts.id,
			publicId: posts.publicId,
			authorId: posts.authorId,
			categoryId: posts.categoryId,
			title: posts.title,
			slug: posts.slug,
			content: posts.content,
			excerpt: posts.excerpt,
			coverImage: posts.coverImage,
			status: posts.status,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			authorFirstName: profiles.firstName,
			authorLastName: profiles.lastName,
			authorAvatar: profiles.avatar,
			commentCount: sql<number>`cast(count(distinct ${comments.id}) as integer)`,
			tags: sql<{ id: string; name: string; slug: string }[]>`
				coalesce(
					json_agg(distinct jsonb_build_object('id', ${tags.id}::text, 'name', ${tags.name}, 'slug', ${tags.slug}))
					filter (where ${tags.id} is not null),
					'[]'::json
				)
			`,
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.leftJoin(comments, eq(comments.postId, posts.id))
		.leftJoin(postTags, eq(postTags.postId, posts.id))
		.leftJoin(tags, eq(tags.id, postTags.tagId))
		.where(and(...conditions))
		.groupBy(posts.id, profiles.id)
		.limit(limit)
		.offset(Math.max(offset, 0));

	return Response.json(rows);
};

export const getPost: Handler = async (req) => {
	const db = getDb();
	const slug = new URL(req.url).pathname.split("/").pop() ?? "";
	const user = requestUser.get(req);

	const [post] = await db
		.select({
			id: posts.id,
			publicId: posts.publicId,
			authorId: posts.authorId,
			categoryId: posts.categoryId,
			title: posts.title,
			slug: posts.slug,
			content: posts.content,
			excerpt: posts.excerpt,
			coverImage: posts.coverImage,
			status: posts.status,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			authorFirstName: profiles.firstName,
			authorLastName: profiles.lastName,
			authorAvatar: profiles.avatar,
			commentCount: sql<number>`cast(count(distinct ${comments.id}) as integer)`,
			reactionCount: sql<number>`cast(count(distinct ${postReactions.id}) as integer)`,
			tags: sql<{ id: string; name: string; slug: string }[]>`
				coalesce(
					json_agg(distinct jsonb_build_object('id', ${tags.id}::text, 'name', ${tags.name}, 'slug', ${tags.slug}))
					filter (where ${tags.id} is not null),
					'[]'::json
				)
			`,
		})
		.from(posts)
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.leftJoin(comments, eq(comments.postId, posts.id))
		.leftJoin(postReactions, eq(postReactions.postId, posts.id))
		.leftJoin(postTags, eq(postTags.postId, posts.id))
		.leftJoin(tags, eq(tags.id, postTags.tagId))
		.where(eq(posts.slug, slug))
		.groupBy(posts.id, profiles.id);

	if (!post || post.status !== "published")
		if (!post || post.authorId !== user?.userId)
			return errRes(404, "Post not found");

	return Response.json(post);
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

	const publicId = new URL(req.url).pathname.split("/").pop() ?? "";
	if (!publicId) return errRes(400, "Invalid post public id");

	const [existing] = await db
		.select()
		.from(posts)
		.where(eq(posts.publicId, publicId));
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
		.select({
			id: posts.id,
			publicId: posts.publicId,
			authorId: posts.authorId,
			categoryId: posts.categoryId,
			title: posts.title,
			slug: posts.slug,
			content: posts.content,
			excerpt: posts.excerpt,
			coverImage: posts.coverImage,
			status: posts.status,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
			authorFirstName: profiles.firstName,
			authorLastName: profiles.lastName,
			authorAvatar: profiles.avatar,
			commentCount: sql<number>`cast(count(distinct ${comments.id}) as integer)`,
			tags: sql<{ id: string; name: string; slug: string }[]>`
				coalesce(
					json_agg(distinct jsonb_build_object('id', ${tags.id}::text, 'name', ${tags.name}, 'slug', ${tags.slug}))
					filter (where ${tags.id} is not null),
					'[]'::json
				)
			`,
		})
		.from(bookmarks)
		.innerJoin(posts, eq(bookmarks.postId, posts.id))
		.leftJoin(profiles, eq(profiles.id, posts.authorId))
		.leftJoin(comments, eq(comments.postId, posts.id))
		.leftJoin(postTags, eq(postTags.postId, posts.id))
		.leftJoin(tags, eq(tags.id, postTags.tagId))
		.where(eq(bookmarks.profileId, user.userId))
		.groupBy(posts.id, profiles.id);

	return Response.json(rows);
};
