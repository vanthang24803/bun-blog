import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import type {
	CreatePostInput,
	ListPostsParams,
	PostDetail,
	PostSummary,
	UpdatePostInput,
} from "@/api/blog.types";
import {
	createPost,
	deletePost,
	getPost,
	listPosts,
	uploadPostCover,
	updatePost,
} from "@/api/posts";

function toRequestOffset(page: number, limit: number) {
	return (page - 1) * limit + 1;
}

export const usePostsStore = defineStore("posts", () => {
	const posts = ref<PostSummary[]>([]);
	const myPosts = ref<PostSummary[]>([]);
	const currentPost = ref<PostDetail | null>(null);
	const loading = ref(false);
	const saving = ref(false);
	const filters = reactive({
		categoryId: "",
		tagId: "",
		limit: 6,
		page: 1,
	});

	const hasNextPage = computed(() => posts.value.length === filters.limit);
	const hasPreviousPage = computed(() => filters.page > 1);

	function buildListParams(
		extra: Partial<ListPostsParams> = {},
	): ListPostsParams {
		const limit = extra.limit ?? filters.limit;
		return {
			limit,
			offset: extra.offset ?? toRequestOffset(filters.page, limit),
			categoryId: extra.categoryId ?? (filters.categoryId || undefined),
			tagId: extra.tagId ?? (filters.tagId || undefined),
			mine: extra.mine,
		};
	}

	async function fetchPosts(params: Partial<ListPostsParams> = {}) {
		loading.value = true;
		try {
			posts.value = await listPosts(buildListParams(params));
		} finally {
			loading.value = false;
		}
	}

	async function fetchMyPosts(limit = filters.limit, page = 1) {
		loading.value = true;
		try {
			myPosts.value = await listPosts({
				limit,
				offset: toRequestOffset(page, limit),
				mine: true,
			});
		} finally {
			loading.value = false;
		}
	}

	async function fetchPost(slug: string) {
		loading.value = true;
		try {
			currentPost.value = await getPost(slug);
		} finally {
			loading.value = false;
		}
	}

	async function create(body: CreatePostInput, coverFile?: File | null) {
		saving.value = true;
		try {
			const nextBody = { ...body };
			if (coverFile) {
				const { url } = await uploadPostCover(coverFile);
				nextBody.coverImage = url;
			}
			const created = await createPost(nextBody);
			myPosts.value = [created, ...myPosts.value];
			return created;
		} finally {
			saving.value = false;
		}
	}

	async function update(
		publicId: string,
		body: UpdatePostInput,
		coverFile?: File | null,
	) {
		saving.value = true;
		try {
			const nextBody = { ...body };
			if (coverFile) {
				const { url } = await uploadPostCover(coverFile);
				nextBody.coverImage = url;
			}
			const updated = await updatePost(publicId, nextBody);
			posts.value = posts.value.map((post) =>
				post.id === updated.id ? { ...post, ...updated } : post,
			);
			myPosts.value = myPosts.value.map((post) =>
				post.id === updated.id ? { ...post, ...updated } : post,
			);
			if (currentPost.value?.id === updated.id) {
				currentPost.value = {
					...currentPost.value,
					...updated,
				};
			}
			return updated;
		} finally {
			saving.value = false;
		}
	}

	async function remove(slug: string) {
		saving.value = true;
		try {
			await deletePost(slug);
			posts.value = posts.value.filter((post) => post.slug !== slug);
			myPosts.value = myPosts.value.filter((post) => post.slug !== slug);
			if (currentPost.value?.slug === slug) currentPost.value = null;
		} finally {
			saving.value = false;
		}
	}

	function setFilters(next: { categoryId?: string; tagId?: string }) {
		filters.categoryId = next.categoryId ?? "";
		filters.tagId = next.tagId ?? "";
		filters.page = 1;
	}

	function setPage(page: number) {
		filters.page = Math.max(1, page);
	}

	return {
		posts,
		myPosts,
		currentPost,
		loading,
		saving,
		filters,
		hasNextPage,
		hasPreviousPage,
		fetchPosts,
		fetchMyPosts,
		fetchPost,
		createPost: create,
		updatePost: update,
		deletePost: remove,
		setFilters,
		setPage,
	};
});
