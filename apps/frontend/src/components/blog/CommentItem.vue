<script setup lang="ts">
defineOptions({ name: "CommentItem" });

import { computed, ref } from "vue";
import type { Comment } from "@/api/blog.types";
import CommentForm from "@/components/blog/CommentForm.vue";
import UserAvatar from "@/components/ui/avatar/UserAvatar.vue";
import { useCommentsStore } from "@/stores/comments";

const props = defineProps<{
	comment: Comment;
	postSlug: string;
	currentUserId?: string | null;
	depth?: number;
}>();

const commentsStore = useCommentsStore();
const showReplyForm = ref(false);
const showReplies = ref(false);
const isEditing = ref(false);

const isOwner = computed(
	() => props.currentUserId === String(props.comment.authorId),
);
const replies = computed(() => commentsStore.replies[props.comment.id] ?? []);
const repliesLoaded = computed(() =>
	Object.hasOwn(commentsStore.replies, props.comment.id),
);

const authorName = computed(() => {
	const {
		authorFirstName: f,
		authorLastName: l,
		authorEmail: e,
	} = props.comment;
	return `${f ?? ""} ${l ?? ""}`.trim() || e || "Anonymous";
});

const authorInitials = computed(() => {
	const {
		authorFirstName: f,
		authorLastName: l,
		authorEmail: e,
	} = props.comment;
	if (f || l) return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();
	return (e?.[0] ?? "?").toUpperCase();
});

const timeLabel = computed(() => {
	const date = new Date(props.comment.createdAt);
	const diff = Date.now() - date.getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
});

const isDeep = computed(() => (props.depth ?? 0) >= 1);

async function toggleReplies() {
	if (!repliesLoaded.value) {
		await commentsStore.fetchReplies(props.comment.id);
	}
	showReplies.value = !showReplies.value;
}

async function handleReply(payload: { content: string; parentId?: string }) {
	await commentsStore.addComment(props.postSlug, payload);
	showReplyForm.value = false;
	showReplies.value = true;
}

async function handleEdit(payload: { content: string }) {
	await commentsStore.editComment(props.comment.id, {
		content: payload.content,
	});
	isEditing.value = false;
}

async function handleDelete() {
	if (!window.confirm("Delete this comment?")) return;
	await commentsStore.removeComment(props.comment.id);
}
</script>

<template>
  <div class="flex gap-3">
    <!-- Avatar column -->
    <div class="flex flex-col items-center gap-1 shrink-0">
      <UserAvatar
        :size="isDeep ? 'sm' : 'md'"
        :src="comment.authorAvatar"
        :initials="authorInitials"
        :alt="authorName"
      />
      <!-- Thread line for replies -->
      <div v-if="showReplies && replies.length" class="flex-1 w-px bg-border/60 my-1" />
    </div>

    <!-- Content column -->
    <div class="flex-1 min-w-0 space-y-2 pb-1">
      <!-- Header -->
      <div class="flex items-baseline justify-between gap-2 flex-wrap">
        <div class="flex items-baseline gap-2">
          <span class="text-sm font-semibold text-foreground">{{ authorName }}</span>
          <span class="text-xs text-muted-foreground">{{ timeLabel }}</span>
        </div>

        <!-- Owner actions -->
        <div v-if="isOwner" class="flex items-center gap-1">
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded"
            @click="isEditing = !isEditing"
          >
            {{ isEditing ? "Cancel" : "Edit" }}
          </button>
          <span class="text-border">·</span>
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Body -->
      <p v-if="!isEditing" class="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
        {{ comment.content }}
      </p>

      <CommentForm
        v-if="isEditing"
        :edit-target="comment"
        :loading="commentsStore.saving"
        compact
        @submitted="handleEdit"
        @cancelled="isEditing = false"
      />

      <!-- Footer actions -->
      <div v-if="!isEditing" class="flex items-center gap-3 pt-0.5">
        <button
          v-if="!isDeep"
          type="button"
          class="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          @click="showReplyForm = !showReplyForm"
        >
          {{ showReplyForm ? "Cancel" : "Reply" }}
        </button>

        <button
          v-if="repliesLoaded ? replies.length > 0 : true"
          type="button"
          class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          @click="toggleReplies"
        >
          <template v-if="!repliesLoaded">Show replies</template>
          <template v-else-if="showReplies">Hide replies ({{ replies.length }})</template>
          <template v-else>Show replies ({{ replies.length }})</template>
        </button>
      </div>

      <!-- Reply form -->
      <CommentForm
        v-if="showReplyForm"
        :parent-id="String(comment.id)"
        :loading="commentsStore.saving"
        compact
        @submitted="handleReply"
        @cancelled="showReplyForm = false"
      />

      <!-- Nested replies -->
      <div v-if="showReplies && replies.length" class="space-y-4 mt-3">
        <CommentItem
          v-for="reply in replies"
          :key="reply.id"
          :comment="reply"
          :post-slug="postSlug"
          :current-user-id="currentUserId"
          :depth="(depth ?? 0) + 1"
        />
      </div>
    </div>
  </div>
</template>
