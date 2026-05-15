<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { getMe } from "@/api/auth";
import CommentForm from "@/components/blog/CommentForm.vue";
import CommentItem from "@/components/blog/CommentItem.vue";
import { useCommentsStore } from "@/stores/comments";

const props = defineProps<{
	postSlug: string;
}>();

const commentsStore = useCommentsStore();
const currentUserId = ref<string | null>(null);

async function loadComments() {
	await commentsStore.fetchComments(props.postSlug);
	if (localStorage.getItem("accessToken")) {
		const profile = await getMe();
		currentUserId.value = profile.id;
	}
}

async function handleComment(payload: { content: string; parentId?: string }) {
	await commentsStore.addComment(props.postSlug, payload);
}

onMounted(loadComments);

watch(
	() => props.postSlug,
	() => {
		commentsStore.replies = {};
		loadComments();
	},
);
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Conversation</p>
        <h2 class="text-2xl font-semibold">Comments</h2>
      </div>
      <span class="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
        {{ commentsStore.comments.length }}
      </span>
    </div>

    <CommentForm :loading="commentsStore.saving" @submitted="handleComment" />

    <div v-if="commentsStore.loading" class="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      Loading comments...
    </div>

    <div v-else-if="commentsStore.comments.length" class="space-y-4">
      <CommentItem
        v-for="comment in commentsStore.comments"
        :key="comment.id"
        :comment="comment"
        :post-slug="props.postSlug"
        :current-user-id="currentUserId"
      />
    </div>

    <div v-else class="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
      No comments yet. Start the thread.
    </div>
  </section>
</template>
