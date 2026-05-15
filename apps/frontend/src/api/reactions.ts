import { apiFetch } from "@/lib/api";
import type {
	CommentReaction,
	CreateReactionInput,
	PostReaction,
} from "./blog.types";

export function reactToPost(postSlug: string, body?: CreateReactionInput) {
	return apiFetch<PostReaction>(`/posts/${postSlug}/reactions`, {
		method: "POST",
		body: JSON.stringify(body ?? {}),
	});
}

export function removePostReaction(postSlug: string) {
	return apiFetch<void>(`/posts/${postSlug}/reactions`, {
		method: "DELETE",
	});
}

export function reactToComment(commentId: string, body?: CreateReactionInput) {
	return apiFetch<CommentReaction>(`/comments/${commentId}/reactions`, {
		method: "POST",
		body: JSON.stringify(body ?? {}),
	});
}

export function removeCommentReaction(commentId: string) {
	return apiFetch<void>(`/comments/${commentId}/reactions`, {
		method: "DELETE",
	});
}
