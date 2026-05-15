<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppNav from "@/components/AppNav.vue";
import CommentList from "@/components/blog/CommentList.vue";
import ReactionBar from "@/components/blog/ReactionBar.vue";
import TagBadge from "@/components/blog/TagBadge.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBookmarksStore } from "@/stores/bookmarks";
import { usePostsStore } from "@/stores/posts";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();
const bookmarksStore = useBookmarksStore();
const authStore = useAuthStore();

const slug = computed(() => String(route.params.slug ?? ""));
const post = computed(() => postsStore.currentPost);
const isBookmarked = computed(
	() => post.value && bookmarksStore.isBookmarked(post.value.id),
);
const publishedLabel = computed(() =>
	post.value
		? new Date(post.value.publishedAt ?? post.value.createdAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: "",
);

async function load() {
	await postsStore.fetchPost(slug.value);
	if (authStore.isLoggedIn) {
		await bookmarksStore.fetchBookmarks();
	}
}

async function toggleBookmark() {
	if (!post.value) return;
	if (!authStore.isLoggedIn) {
		router.push("/login");
		return;
	}
	if (bookmarksStore.isBookmarked(post.value.id)) {
		await bookmarksStore.remove(post.value.slug);
	} else {
		await bookmarksStore.add(post.value.slug);
	}
}

onMounted(load);
watch(slug, load);
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNav />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Back link -->
      <RouterLink to="/blog" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to blog
      </RouterLink>

      <!-- Loading -->
      <div v-if="postsStore.loading" class="flex flex-col items-center justify-center py-24 gap-3">
        <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">Loading post…</p>
      </div>

      <template v-else-if="post">
        <!-- Article card -->
        <Card class="overflow-hidden">
          <!-- Cover image / gradient -->
          <div
            class="h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-background"
            :style="
              post.coverImage
                ? { backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined
            "
          />

          <CardContent class="p-8 space-y-8">
            <!-- Meta -->
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span class="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
                  {{ post.status }}
                </span>
                <span>{{ publishedLabel }}</span>
              </div>

              <h1 class="text-4xl font-bold tracking-tight">{{ post.title }}</h1>

              <p v-if="post.excerpt" class="text-lg leading-8 text-muted-foreground max-w-3xl">
                {{ post.excerpt }}
              </p>
            </div>

            <!-- Tags -->
            <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
              <TagBadge v-for="tag in post.tags" :key="tag.id" :label="tag.name" />
            </div>

            <Separator />

            <!-- Content -->
            <div
              class="prose-content text-base leading-8 text-foreground/90"
              v-html="post.content"
            />

            <Separator />

            <!-- Actions -->
            <div class="flex flex-wrap items-center gap-3">
              <ReactionBar :post-slug="post.slug" :initial-count="post.reactionCount" />

              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="toggleBookmark"
              >
                <svg
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'fill-foreground': isBookmarked }"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ isBookmarked ? "Saved" : "Save to bookmarks" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Comments -->
        <CommentList :post-slug="post.slug" />
      </template>

      <!-- Not found -->
      <div v-else class="flex flex-col items-center justify-center py-24 gap-3">
        <p class="text-sm text-muted-foreground">Post not found.</p>
        <RouterLink to="/blog">
          <Button variant="outline" size="sm">Back to blog</Button>
        </RouterLink>
      </div>

    </main>
  </div>
</template>
