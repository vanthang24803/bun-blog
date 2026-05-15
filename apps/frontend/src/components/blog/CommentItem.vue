<script setup lang="ts">
defineOptions({ name: "CommentItem" });

import { computed, ref } from "vue";
import type { Comment } from "@/api/blog.types";
import CommentForm from "@/components/blog/CommentForm.vue";
import { Button } from "@/components/ui/button";
import { useCommentsStore } from "@/stores/comments";

const props = defineProps<{
	comment: Comment;
	postSlug: string;
	currentUserId?: string | null;
}>();

const commentsStore = useCommentsStore();
const showReplyForm = ref(false);
const showReplies = ref(false);
const isEditing = ref(false);

const isOwner = computed(() => props.currentUserId === props.comment.authorId);
const replies = computed(() => commentsStore.replies[props.comment.id] ?? []);
const repliesLoaded = computed(() =>
	Object.prototype.hasOwnProperty.call(commentsStore.replies, props.comment.id),
);
const createdLabel = computed(() =>
	new Date(props.comment.createdAt).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}),
);

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
	await commentsStore.editComment(props.comment.id, { content: payload.content });
	isEditing.value = false;
}

async function handleDelete() {
	if (!window.confirm("Delete this comment?")) return;
	await commentsStore.removeComment(props.comment.id);
}
</script>

<template>
  <div class="space-y-4 rounded-3xl border border-border/60 bg-white/90 p-4 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-foreground">Author {{ props.comment.authorId.slice(0, 8) }}</p>
        <p class="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {{ createdLabel }}
        </p>
      </div>
      <div v-if="isOwner" class="flex items-center gap-2">
        <Button type="button" size="sm" variant="ghost" @click="isEditing = !isEditing">
          {{ isEditing ? "Close" : "Edit" }}
        </Button>
        <Button type="button" size="sm" variant="ghost" class="text-destructive" @click="handleDelete">
          Delete
        </Button>
      </div>
    </div>

    <p v-if="!isEditing" class="text-sm leading-7 text-foreground/85">
      {{ props.comment.content }}
    </p>

    <CommentForm
      v-if="isEditing"
      :edit-target="props.comment"
      :loading="commentsStore.saving"
      @submitted="handleEdit"
      @cancelled="isEditing = false"
    />

    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" @click="showReplyForm = !showReplyForm">
        {{ showReplyForm ? "Close reply" : "Reply" }}
      </Button>
      <Button type="button" size="sm" variant="ghost" @click="toggleReplies">
        {{ showReplies ? "Hide replies" : "Show replies" }}
      </Button>
    </div>

    <CommentForm
      v-if="showReplyForm"
      :parent-id="props.comment.id"
      :loading="commentsStore.saving"
      @submitted="handleReply"
      @cancelled="showReplyForm = false"
    />

    <div v-if="showReplies && replies.length" class="space-y-3 border-l border-border/70 pl-4">
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        :post-slug="props.postSlug"
        :current-user-id="props.currentUserId"
      />
    </div>
  </div>
</template>
