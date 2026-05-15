import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { PostSummary } from "@/api/blog.types";
import { addBookmark, listMyBookmarks, removeBookmark } from "@/api/bookmarks";

export const useBookmarksStore = defineStore("bookmarks", () => {
	const bookmarks = ref<PostSummary[]>([]);
	const loading = ref(false);
	const saving = ref(false);
	const bookmarkedIds = computed(
		() => new Set(bookmarks.value.map((post) => post.id)),
	);

	async function fetchBookmarks() {
		loading.value = true;
		try {
			bookmarks.value = await listMyBookmarks();
		} finally {
			loading.value = false;
		}
	}

	async function add(postSlug: string) {
		saving.value = true;
		try {
			await addBookmark(postSlug);
			await fetchBookmarks();
		} finally {
			saving.value = false;
		}
	}

	async function remove(postSlug: string) {
		saving.value = true;
		try {
			await removeBookmark(postSlug);
			bookmarks.value = bookmarks.value.filter(
				(post) => post.slug !== postSlug,
			);
		} finally {
			saving.value = false;
		}
	}

	function isBookmarked(postId: string) {
		return bookmarkedIds.value.has(postId);
	}

	return {
		bookmarks,
		loading,
		saving,
		fetchBookmarks,
		add,
		remove,
		isBookmarked,
	};
});
