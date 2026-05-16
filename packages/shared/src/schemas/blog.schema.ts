import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z
	.string()
	.regex(slugRegex, "slug must be lowercase alphanumeric with hyphens");

export const createPostSchema = z.object({
	title: z.string().min(1).max(255),
	slug,
	content: z.string().min(1),
	excerpt: z.string().optional(),
	coverImage: z.url("coverImage must be a valid URL").optional(),
	categoryId: z.number().int().positive().optional(),
	tagIds: z.array(z.number().int().positive()).optional(),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const updatePostSchema = z
	.object({
		title: z.string().min(1).max(255).optional(),
		slug: slug.optional(),
		content: z.string().min(1).optional(),
		excerpt: z.string().optional(),
		coverImage: z.url("coverImage must be a valid URL").optional(),
		categoryId: z.number().int().positive().optional(),
		tagIds: z.array(z.number().int().positive()).optional(),
		status: z.enum(["draft", "published", "archived"]).optional(),
	})
	.refine((d) => Object.values(d).some((v) => v !== undefined), {
		message: "at least one field is required",
	});

export const createCategorySchema = z.object({
	name: z.string().min(1).max(100),
	slug,
	description: z.string().optional(),
});

export const createTagSchema = z.object({
	name: z.string().min(1).max(50),
	slug,
});

export const createCommentSchema = z.object({
	content: z.string().min(1).max(5000),
	parentId: z.number().int().positive().optional(),
});

export const updateCommentSchema = z.object({
	content: z.string().min(1).max(5000),
});

export const createReactionSchema = z.object({
	type: z.enum(["like", "love", "insightful"]).default("like"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateReactionInput = z.infer<typeof createReactionSchema>;
