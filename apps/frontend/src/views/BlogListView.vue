<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/composables/usePageTitle";
import AppLayout from "@/components/AppLayout.vue";
import PostCard from "@/components/blog/PostCard.vue";
import PostFilters from "@/components/blog/PostFilters.vue";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";

const { t } = useI18n();
usePageTitle(() => null);
const postsStore = usePostsStore();
const authStore = useAuthStore();

async function refresh() {
	await postsStore.fetchPosts();
}

function updateFilters(value: { categoryId?: string; tagId?: string }) {
	postsStore.setFilters(value);
	refresh();
}

async function goToPage(page: number) {
	postsStore.setPage(page);
	await refresh();
}

const visiblePages = computed(() => {
	const current = postsStore.filters.page;
	const maxKnown = current + (postsStore.hasNextPage ? 1 : 0);
	const start = Math.max(1, current - 2);
	const end = Math.min(maxKnown, current + 2);
	const pages: (number | "...")[] = [];
	if (start > 1) {
		pages.push(1);
		if (start > 2) pages.push("...");
	}
	for (let i = start; i <= end; i++) pages.push(i);
	return pages;
});

onMounted(refresh);

watch(
	() => postsStore.filters.page,
	() => refresh(),
);
</script>

<template>
  <AppLayout>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Filters -->
      <PostFilters
        :model-value="{
          categoryId: postsStore.filters.categoryId || undefined,
          tagId: postsStore.filters.tagId || undefined,
        }"
        @update:model-value="updateFilters"
      />

      <!-- Loading -->
      <div v-if="postsStore.loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">{{ t('blog.loadingPosts') }}</p>
      </div>

      <!-- Posts grid -->
      <div v-else-if="postsStore.posts.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" />
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-20 gap-3 rounded-xl border border-dashed border-border">
        <svg class="h-8 w-8 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="text-sm text-muted-foreground">{{ t('blog.noPostsFound') }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="!postsStore.loading && visiblePages.length > 1" class="flex items-center justify-center gap-1 pt-2">
        <template v-for="(page, i) in visiblePages" :key="i">
          <span v-if="page === '...'" class="px-2 text-sm text-muted-foreground select-none">…</span>
          <Button
            v-else
            :variant="page === postsStore.filters.page ? 'default' : 'outline'"
            size="sm"
            class="h-8 w-8 p-0 text-sm font-medium"
            :disabled="page === postsStore.filters.page"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
        </template>
      </div>

    </main>
  </AppLayout>
</template>
