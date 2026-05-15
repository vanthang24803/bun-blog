<script setup lang="ts">
import { onMounted } from "vue";
import AppNav from "@/components/AppNav.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { usePostsStore } from "@/stores/posts";

const postsStore = usePostsStore();

async function load() {
	await postsStore.fetchMyPosts();
}

async function destroy(slug: string) {
	if (!window.confirm("Delete this post? This cannot be undone.")) return;
	await postsStore.deletePost(slug);
}

onMounted(load);

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
	if (status === "published") return "default";
	if (status === "draft") return "secondary";
	if (status === "archived") return "outline";
	return "secondary";
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNav />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground uppercase tracking-widest">My content</p>
          <h1 class="text-3xl font-bold tracking-tight">My posts</h1>
          <p class="text-sm text-muted-foreground">Manage your drafts, published posts, and archives.</p>
        </div>
        <RouterLink to="/me/posts/new">
          <Button class="shrink-0">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            New post
          </Button>
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="postsStore.loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">Loading your posts…</p>
      </div>

      <!-- Posts list -->
      <div v-else-if="postsStore.myPosts.length" class="space-y-4">
        <Card v-for="post in postsStore.myPosts" :key="post.id" class="overflow-hidden hover:shadow-sm transition-shadow">
          <CardHeader class="pb-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-1 min-w-0">
                <CardTitle class="text-lg leading-tight truncate">{{ post.title }}</CardTitle>
                <CardDescription class="text-xs font-mono">{{ post.slug }}</CardDescription>
              </div>
              <Badge :variant="statusVariant(post.status)" class="capitalize shrink-0 self-start">
                {{ post.status }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="line-clamp-2 text-sm text-muted-foreground leading-6 mb-4">
              {{ post.excerpt || post.content }}
            </p>
            <div class="flex items-center gap-2">
              <RouterLink :to="`/blog/${post.slug}`">
                <Button variant="ghost" size="sm">
                  <svg class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  View
                </Button>
              </RouterLink>
              <RouterLink :to="`/me/posts/${post.slug}/edit`">
                <Button variant="outline" size="sm">
                  <svg class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Edit
                </Button>
              </RouterLink>
              <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="destroy(post.slug)">
                <svg class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-border">
        <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <svg class="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-medium">No posts yet</p>
          <p class="text-xs text-muted-foreground">Start writing your first post.</p>
        </div>
        <RouterLink to="/me/posts/new">
          <Button size="sm">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Write your first post
          </Button>
        </RouterLink>
      </div>

    </main>
  </div>
</template>
