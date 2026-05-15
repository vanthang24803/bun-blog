<script setup lang="ts">
import { useRouter } from "vue-router";
import type { CreatePostInput } from "@/api/blog.types";
import AppNav from "@/components/AppNav.vue";
import PostForm from "@/components/blog/PostForm.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostsStore } from "@/stores/posts";

const router = useRouter();
const postsStore = usePostsStore();

async function handleSubmit(payload: CreatePostInput) {
	await postsStore.createPost(payload);
	router.push("/me/posts");
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNav />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <RouterLink to="/me/posts" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          My posts
        </RouterLink>
      </div>

      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-xl">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground font-normal uppercase tracking-widest">New post</p>
              <p class="text-2xl font-bold">Create a post</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm :loading="postsStore.saving" submit-label="Publish post" @submit="handleSubmit" />
        </CardContent>
      </Card>

    </main>
  </div>
</template>
