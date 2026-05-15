<script setup lang="ts">
import { ref, watch } from "vue";
import type { Comment } from "@/api/blog.types";
import { Button } from "@/components/ui/button";

const props = withDefaults(
	defineProps<{
		editTarget?: Comment | null;
		parentId?: string;
		loading?: boolean;
	}>(),
	{
		editTarget: null,
		parentId: undefined,
		loading: false,
	},
);

const emit = defineEmits<{
	submitted: [payload: { content: string; parentId?: string }];
	cancelled: [];
}>();

const content = ref("");

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
	emit("submitted", {
		content: value,
		parentId: props.parentId,
	});
	if (!props.editTarget) content.value = "";
}
</script>

<template>
  <form class="space-y-3 rounded-3xl border border-border/70 bg-white/90 p-4" @submit.prevent="handleSubmit">
    <textarea
      v-model="content"
      rows="4"
      class="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-ring"
      :placeholder="props.editTarget ? 'Update your comment' : props.parentId ? 'Write a reply' : 'Join the discussion'"
    />
    <div class="flex items-center justify-end gap-2">
      <Button
        v-if="props.editTarget || props.parentId"
        type="button"
        variant="ghost"
        @click="emit('cancelled')"
      >
        Cancel
      </Button>
      <Button type="submit" :disabled="props.loading">
        {{ props.loading ? "Saving..." : props.editTarget ? "Save" : props.parentId ? "Reply" : "Post comment" }}
      </Button>
    </div>
  </form>
</template>
