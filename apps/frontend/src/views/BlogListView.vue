<script setup lang="ts">
import { onMounted, watch } from "vue";
import AppNav from "@/components/AppNav.vue";
import PostCard from "@/components/blog/PostCard.vue";
import PostFilters from "@/components/blog/PostFilters.vue";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";

const postsStore = usePostsStore();
const authStore = useAuthStore();

async function refresh() {
	await postsStore.fetchPosts();
}

function updateFilters(value: { categoryId?: string; tagId?: string }) {
	postsStore.setFilters(value);
	refresh();
}

async function nextPage() {
	postsStore.setPage(postsStore.filters.page + 1);
	await refresh();
}

async function previousPage() {
	postsStore.setPage(postsStore.filters.page - 1);
	await refresh();
}

onMounted(refresh);

watch(
	() => postsStore.filters.page,
	() => refresh(),
);
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNav />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground uppercase tracking-widest">Blog</p>
          <h1 class="text-3xl font-bold tracking-tight">All posts</h1>
          <p class="text-sm text-muted-foreground max-w-xl">
            Browse published posts, filter by category or tag, and jump into the latest discussions.
          </p>
        </div>
        <RouterLink v-if="authStore.isLoggedIn" to="/me/posts/new">
          <Button class="shrink-0">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            New post
          </Button>
        </RouterLink>
      </div>

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
        <p class="text-sm text-muted-foreground">Loading posts…</p>
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
        <p class="text-sm text-muted-foreground">No posts matched the current filters.</p>
      </div>

      <!-- Pagination -->
      <div v-if="!postsStore.loading" class="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!postsStore.hasPreviousPage"
          @click="previousPage"
        >
          <svg class="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Previous
        </Button>
        <span class="text-xs text-muted-foreground">Page {{ postsStore.filters.page }}</span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!postsStore.hasNextPage"
          @click="nextPage"
        >
          Next
          <svg class="h-4 w-4 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </Button>
      </div>

    </main>
  </div>
</template>
