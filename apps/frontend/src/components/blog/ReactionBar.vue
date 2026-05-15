<script setup lang="ts">
import { computed, ref } from "vue";
import type { ReactionType } from "@/api/blog.types";
import { reactToPost, removePostReaction } from "@/api/reactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const props = defineProps<{
	postSlug: string;
	initialCount: number;
}>();

const currentType = ref<ReactionType | null>(null);
const count = ref(props.initialCount);
const loading = ref(false);
const hasToken = computed(() => Boolean(localStorage.getItem("accessToken")));

async function setReaction(next: ReactionType) {
	if (!hasToken.value || loading.value) return;
	loading.value = true;
	try {
		if (currentType.value === next) {
			await removePostReaction(props.postSlug);
			currentType.value = null;
			count.value = Math.max(0, count.value - 1);
			return;
		}

		const previous = currentType.value;
		await reactToPost(props.postSlug, { type: next });
		currentType.value = next;
		if (!previous) count.value += 1;
	} finally {
		loading.value = false;
	}
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 rounded-3xl border border-border/70 bg-white/90 p-4 shadow-sm">
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!hasToken || loading"
      :class="currentType === 'like' ? 'border-emerald-400 bg-emerald-50' : ''"
      @click="setReaction('like')"
    >
      👍 Like
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!hasToken || loading"
      :class="currentType === 'love' ? 'border-rose-400 bg-rose-50' : ''"
      @click="setReaction('love')"
    >
      ❤️ Love
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="!hasToken || loading"
      :class="currentType === 'insightful' ? 'border-amber-400 bg-amber-50' : ''"
      @click="setReaction('insightful')"
    >
      💡 Insightful
    </Button>
    <Badge variant="secondary" class="ml-auto">
      {{ count }} reaction{{ count === 1 ? "" : "s" }}
    </Badge>
  </div>
</template>
