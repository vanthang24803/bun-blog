import { apiFetch } from "@/lib/api";
import type { Bookmark, PostSummary } from "./blog.types";

export function listMyBookmarks() {
	return apiFetch<PostSummary[]>("/me/bookmarks");
}

export function addBookmark(postSlug: string) {
	return apiFetch<Bookmark>(`/posts/${postSlug}/bookmarks`, {
		method: "POST",
	});
}

export function removeBookmark(postSlug: string) {
	return apiFetch<void>(`/posts/${postSlug}/bookmarks`, {
		method: "DELETE",
	});
}
