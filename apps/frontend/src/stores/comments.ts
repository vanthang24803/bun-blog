import { defineStore } from "pinia";
import { ref } from "vue";
import type {
	Comment,
	CreateCommentInput,
	UpdateCommentInput,
} from "@/api/blog.types";
import {
	createComment,
	deleteComment,
	listComments,
	listReplies,
	updateComment,
} from "@/api/comments";

function replaceComment(items: Comment[], updated: Comment) {
	return items.map((comment) =>
		comment.id === updated.id ? updated : comment,
	);
}

export const useCommentsStore = defineStore("comments", () => {
	const comments = ref<Comment[]>([]);
	const replies = ref<Record<string, Comment[]>>({});
	const loading = ref(false);
	const saving = ref(false);

	async function fetchComments(postSlug: string) {
		loading.value = true;
		try {
			comments.value = await listComments(postSlug);
		} finally {
			loading.value = false;
		}
	}

	async function fetchReplies(commentId: string) {
		loading.value = true;
		try {
			replies.value = {
				...replies.value,
				[commentId]: await listReplies(commentId),
			};
		} finally {
			loading.value = false;
		}
	}

	async function addCommentToPost(postSlug: string, body: CreateCommentInput) {
		saving.value = true;
		try {
			const created = await createComment(postSlug, body);
			if (created.parentId) {
				replies.value = {
					...replies.value,
					[created.parentId]: [
						...(replies.value[created.parentId] ?? []),
						created,
					],
				};
			} else {
				comments.value = [...comments.value, created];
			}
			return created;
		} finally {
			saving.value = false;
		}
	}

	async function editComment(commentId: string, body: UpdateCommentInput) {
		saving.value = true;
		try {
			const updated = await updateComment(commentId, body);
			comments.value = replaceComment(comments.value, updated);
			replies.value = Object.fromEntries(
				Object.entries(replies.value).map(([key, list]) => [
					key,
					replaceComment(list, updated),
				]),
			);
			return updated;
		} finally {
			saving.value = false;
		}
	}

	async function removeComment(commentId: string) {
		saving.value = true;
		try {
			await deleteComment(commentId);
			comments.value = comments.value.filter(
				(comment) => comment.id !== commentId,
			);
			replies.value = Object.fromEntries(
				Object.entries(replies.value).map(([key, list]) => [
					key,
					list.filter((comment) => comment.id !== commentId),
				]),
			);
		} finally {
			saving.value = false;
		}
	}

	return {
		comments,
		replies,
		loading,
		saving,
		fetchComments,
		fetchReplies,
		addComment: addCommentToPost,
		editComment,
		removeComment,
	};
});
