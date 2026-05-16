<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { usePageTitle } from "@/composables/usePageTitle";
import type { PostSubmitPayload, UpdatePostInput } from "@/api/blog.types";
import AppLayout from "@/components/AppLayout.vue";
import PostForm from "@/components/blog/PostForm.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostsStore } from "@/stores/posts";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();
usePageTitle(() => t("pageTitle.editPost"));

const slug = computed(() => String(route.params.slug ?? ""));
const initialValues = computed(() =>
	postsStore.currentPost
		? {
				...postsStore.currentPost,
				tagIds: postsStore.currentPost.tags.map((tag) => tag.id),
			}
		: undefined,
);

async function load() {
	await postsStore.fetchPost(slug.value);
}

async function handleSubmit({ payload, coverFile }: PostSubmitPayload) {
	if (!postsStore.currentPost) return;
	await postsStore.updatePost(
		String(postsStore.currentPost.publicId),
		payload as UpdatePostInput,
		coverFile,
	);
	router.push("/me/posts");
}

onMounted(load);
watch(slug, load);
</script>

<template>
  <AppLayout>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Back link -->
      <RouterLink to="/me/posts" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        My posts
      </RouterLink>

      <!-- Loading -->
      <div v-if="postsStore.loading && !initialValues" class="flex flex-col items-center justify-center py-24 gap-3">
        <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">Loading post…</p>
      </div>

      <Card v-else-if="initialValues">
        <CardHeader class="pb-4">
          <CardTitle class="text-xl">
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground font-normal uppercase tracking-widest">Editing</p>
              <p class="text-2xl font-bold truncate">{{ initialValues.title || "Edit post" }}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm
            :initial-values="initialValues"
            :loading="postsStore.saving || postsStore.loading"
            submit-label="Save changes"
            @submit="handleSubmit"
          />
        </CardContent>
      </Card>

    </main>
  </AppLayout>
</template>
