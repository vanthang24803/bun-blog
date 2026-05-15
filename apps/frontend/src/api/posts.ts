import { apiFetch } from "@/lib/api";
import type {
	CreatePostInput,
	ListPostsParams,
	PostDetail,
	PostSummary,
	UpdatePostInput,
} from "./blog.types";

function buildParams(params?: ListPostsParams) {
	const search = new URLSearchParams();
	if (!params) return search;
	if (params.limit !== undefined) search.set("limit", String(params.limit));
	if (params.offset !== undefined) search.set("offset", String(params.offset));
	if (params.categoryId) search.set("categoryId", params.categoryId);
	if (params.tagId) search.set("tagId", params.tagId);
	if (params.mine) search.set("mine", "1");
	return search;
}

export async function listPosts(params?: ListPostsParams) {
	const query = buildParams(params).toString();
	return apiFetch<PostSummary[]>(`/posts${query ? `?${query}` : ""}`);
}

export function getPost(slug: string) {
	return apiFetch<PostDetail>(`/posts/${slug}`);
}

export function createPost(body: CreatePostInput) {
	return apiFetch<PostSummary>("/posts", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function updatePost(slug: string, body: UpdatePostInput) {
	return apiFetch<PostSummary>(`/posts/${slug}`, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}

export function deletePost(slug: string) {
	return apiFetch<void>(`/posts/${slug}`, {
		method: "DELETE",
	});
}
