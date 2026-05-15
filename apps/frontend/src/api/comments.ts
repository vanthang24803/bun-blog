import { apiFetch } from "@/lib/api";
import type {
	Comment,
	CreateCommentInput,
	UpdateCommentInput,
} from "./blog.types";

export function listComments(postSlug: string) {
	return apiFetch<Comment[]>(`/posts/${postSlug}/comments`);
}

export function listReplies(commentId: string) {
	return apiFetch<Comment[]>(`/comments/${commentId}/replies`);
}

export function createComment(postSlug: string, body: CreateCommentInput) {
	return apiFetch<Comment>(`/posts/${postSlug}/comments`, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function updateComment(commentId: string, body: UpdateCommentInput) {
	return apiFetch<Comment>(`/comments/${commentId}`, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}

export function deleteComment(commentId: string) {
	return apiFetch<void>(`/comments/${commentId}`, {
		method: "DELETE",
	});
}
