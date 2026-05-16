import type {
	CreateCategoryInput,
	CreateCommentInput,
	CreatePostInput,
	CreateReactionInput,
	CreateTagInput,
	UpdateCommentInput,
	UpdatePostInput,
} from "@app/shared/schemas/blog.schema";

export type {
	CreateCategoryInput,
	CreateCommentInput,
	CreatePostInput,
	CreateReactionInput,
	CreateTagInput,
	UpdateCommentInput,
	UpdatePostInput,
};

export type PostStatus = "draft" | "published" | "archived";
export type ReactionType = "like" | "love" | "insightful";

export interface PostSubmitPayload {
	payload: CreatePostInput | UpdatePostInput;
	coverFile: File | null;
}

export interface Category {
	id: string;
	publicId: string;
	name: string;
	slug: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Tag {
	id: string;
	publicId: string;
	name: string;
	slug: string;
	createdAt: string;
}

export interface PostSummary {
	id: string;
	publicId: string;
	authorId: string;
	categoryId: string | null;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	coverImage: string | null;
	status: PostStatus;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PostDetail extends PostSummary {
	tags: Tag[];
	reactionCount: number;
}

export interface Comment {
	id: string;
	publicId: string;
	postId: string;
	authorId: string;
	parentId: string | null;
	content: string;
	createdAt: string;
	updatedAt: string;
	authorFirstName: string | null;
	authorLastName: string | null;
	authorAvatar: string | null;
	authorEmail: string | null;
}

export interface PostReaction {
	id: string;
	postId: string;
	profileId: string;
	type: ReactionType;
	createdAt: string;
}

export interface CommentReaction {
	id: string;
	commentId: string;
	profileId: string;
	type: ReactionType;
	createdAt: string;
}

export interface Bookmark {
	id: string;
	postId: string;
	profileId: string;
	createdAt: string;
}

export interface ListPostsParams {
	limit?: number;
	offset?: number;
	categoryId?: string;
	tagId?: string;
	mine?: boolean;
}
