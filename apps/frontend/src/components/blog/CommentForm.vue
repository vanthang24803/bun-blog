<script setup lang="ts">
import { ref, watch } from "vue";
import type { Comment } from "@/api/blog.types";
import { Button } from "@/components/ui/button";

const props = withDefaults(
	defineProps<{
		editTarget?: Comment | null;
		parentId?: string;
		loading?: boolean;
		compact?: boolean;
	}>(),
	{
		editTarget: null,
		parentId: undefined,
		loading: false,
		compact: false,
	},
);

const emit = defineEmits<{
	submitted: [payload: { content: string; parentId?: string }];
	cancelled: [];
}>();

const content = ref("");
const focused = ref(false);

watch(
	() => props.editTarget,
	(value) => {
		content.value = value?.content ?? "";
	},
	{ immediate: true },
);

function handleSubmit() {
	const value = content.value.trim();
	if (!value) return;
	emit("submitted", { content: value, parentId: props.parentId });
	if (!props.editTarget) content.value = "";
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div
      class="rounded-xl border transition-colors"
      :class="focused ? 'border-ring' : 'border-border/60 hover:border-border'"
    >
      <textarea
        v-model="content"
        :rows="compact ? 2 : 4"
        class="w-full bg-transparent px-4 py-3 text-sm leading-6 outline-none resize-none rounded-t-xl placeholder:text-muted-foreground"
        :placeholder="editTarget ? 'Update your comment…' : parentId ? 'Write a reply…' : 'Join the discussion…'"
        @focus="focused = true"
        @blur="focused = false"
      />
      <div
        class="flex items-center justify-end gap-2 px-3 py-2 border-t border-border/40"
        :class="compact ? 'py-1.5' : 'py-2'"
      >
        <Button
          v-if="editTarget || parentId"
          type="button"
          variant="ghost"
          size="sm"
          @click="emit('cancelled')"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" :disabled="loading || !content.trim()">
          <svg
            v-if="loading"
            class="animate-spin h-3.5 w-3.5 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ loading ? "Saving…" : editTarget ? "Save" : parentId ? "Reply" : "Post comment" }}
        </Button>
      </div>
    </div>
  </form>
</template>
