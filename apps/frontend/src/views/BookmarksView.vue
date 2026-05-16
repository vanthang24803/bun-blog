<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/composables/usePageTitle";
import AppLayout from "@/components/AppLayout.vue";
import PostCard from "@/components/blog/PostCard.vue";
import { Button } from "@/components/ui/button";
import { useBookmarksStore } from "@/stores/bookmarks";

const { t } = useI18n();
usePageTitle(() => t("pageTitle.bookmarks"));
const bookmarksStore = useBookmarksStore();

onMounted(() => {
	bookmarksStore.fetchBookmarks();
});
</script>

<template>
  <AppLayout>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Header -->
      <div class="space-y-1">
        <p class="text-xs text-muted-foreground uppercase tracking-widest">{{ t('bookmarks.label') }}</p>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('bookmarks.title') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('bookmarks.description') }}</p>
      </div>

      <!-- Loading -->
      <div v-if="bookmarksStore.loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">{{ t('bookmarks.loading') }}</p>
      </div>

      <!-- Grid -->
      <div v-else-if="bookmarksStore.bookmarks.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <PostCard v-for="post in bookmarksStore.bookmarks" :key="post.id" :post="post" />
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-border">
        <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <svg class="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-medium">{{ t('bookmarks.empty') }}</p>
          <p class="text-xs text-muted-foreground">{{ t('bookmarks.emptyDesc') }}</p>
        </div>
        <RouterLink to="/blog">
          <Button variant="outline" size="sm">{{ t('bookmarks.browseBlog') }}</Button>
        </RouterLink>
      </div>

    </main>
  </AppLayout>
</template>
