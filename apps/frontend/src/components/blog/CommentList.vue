<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { getMe } from "@/api/auth";
import CommentForm from "@/components/blog/CommentForm.vue";
import CommentItem from "@/components/blog/CommentItem.vue";
import UserAvatar from "@/components/ui/avatar/UserAvatar.vue";
import { useCommentsStore } from "@/stores/comments";

const props = defineProps<{ postSlug: string }>();

const commentsStore = useCommentsStore();
const currentUserId = ref<string | null>(null);
const currentUserAvatar = ref<string | null>(null);
const currentUserInitials = ref("?");

async function loadComments() {
	await commentsStore.fetchComments(props.postSlug);
	if (localStorage.getItem("accessToken")) {
		const profile = await getMe();
		currentUserId.value = String(profile.id);
		currentUserAvatar.value = profile.avatar ?? null;
		const f = profile.firstName?.[0] ?? "";
		const l = profile.lastName?.[0] ?? "";
		currentUserInitials.value =
			(f + l).toUpperCase() || profile.email[0].toUpperCase();
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
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-0.5">
        <h2 class="text-xl font-semibold">Comments ({{ commentsStore.comments.length }})</h2>
      </div>
      <span
        v-if="commentsStore.comments.length"
        class="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary px-2 text-xs font-medium text-secondary-foreground"
      >
        {{ commentsStore.comments.length }}
      </span>
    </div>

    <!-- Compose area -->
    <div class="flex gap-3">
      <UserAvatar
        v-if="currentUserId"
        size="md"
        :src="currentUserAvatar"
        :initials="currentUserInitials"
        class="mt-0.5 shrink-0"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-muted shrink-0 mt-0.5 flex items-center justify-center"
      >
        <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <CommentForm :loading="commentsStore.saving" @submitted="handleComment" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="commentsStore.loading" class="flex items-center gap-2 py-6 text-sm text-muted-foreground">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Loading comments…
    </div>

    <!-- Comment list -->
    <div v-else-if="commentsStore.comments.length" class="space-y-5">
      <CommentItem
        v-for="comment in commentsStore.comments"
        :key="comment.id"
        :comment="comment"
        :post-slug="postSlug"
        :current-user-id="currentUserId"
        :depth="0"
      />
    </div>

    <!-- Empty -->
    <div v-else class="py-8 text-center text-sm text-muted-foreground">
      No comments yet. Be the first to start the discussion.
    </div>
  </section>
</template>
