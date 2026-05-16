<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/composables/usePageTitle";
import AppLayout from "@/components/AppLayout.vue";
import MyPostCardSkeleton from "@/components/blog/MyPostCardSkeleton.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { usePostsStore } from "@/stores/posts";

const { t } = useI18n();
usePageTitle(() => t("pageTitle.myPosts"));
const postsStore = usePostsStore();

async function load() {
	await postsStore.fetchMyPosts();
}

async function destroy(publicId: string, slug: string) {
	if (!window.confirm(t("myPosts.confirmDelete"))) return;
	await postsStore.deletePost(publicId, slug);
}

onMounted(load);

function statusVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	if (status === "published") return "default";
	if (status === "draft") return "secondary";
	if (status === "archived") return "outline";
	return "secondary";
}
</script>

<template>
  <AppLayout>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground uppercase tracking-widest">{{ t('myPosts.label') }}</p>
          <h1 class="text-3xl font-bold tracking-tight">{{ t('myPosts.title') }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('myPosts.description') }}</p>
        </div>
        <RouterLink to="/me/posts/new">
          <Button class="shrink-0">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('myPosts.newPost') }}
          </Button>
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="postsStore.loading" class="space-y-5">
        <MyPostCardSkeleton v-for="i in 3" :key="i" />
        <p class="text-center text-sm text-muted-foreground">{{ t('myPosts.loading') }}</p>
      </div>

      <!-- Posts list -->
      <div v-else-if="postsStore.myPosts.length" class="space-y-5">
        <Card
          v-for="post in postsStore.myPosts"
          :key="post.id"
          class="overflow-hidden border-border/70 transition-all duration-200 hover:border-border hover:shadow-md"
        >
          <CardContent class="p-0">
            <div class="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
              <div
                class="relative min-h-52 bg-gradient-to-br from-primary/10 via-primary/5 to-background"
                :style="
                  post.coverImage
                    ? {
                        backgroundImage: `url(${post.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                "
              >
                <div class="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent" />
              </div>

              <div class="flex min-w-0 flex-col justify-between p-6">
                <div class="space-y-4">
                  <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    <span>{{ post.slug }}</span>
                    <span class="text-border">•</span>
                    <span>
                      {{
                        post.status === "published" && post.publishedAt
                          ? t("myPosts.published")
                          : t("myPosts.created")
                      }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0 space-y-2">
                      <CardTitle class="text-2xl leading-tight tracking-tight">
                        {{ post.title }}
                      </CardTitle>
                      <CardDescription class="line-clamp-3 max-w-2xl text-sm leading-7 text-foreground/72">
                        {{ post.excerpt || post.content }}
                      </CardDescription>
                    </div>
                    <Badge
                      :variant="statusVariant(post.status)"
                      class="shrink-0 self-start capitalize"
                    >
                      {{ post.status }}
                    </Badge>
                  </div>
                </div>

                <div class="mt-6 flex flex-wrap items-center gap-2">
                  <RouterLink :to="`/blog/${post.slug}`">
                    <Button variant="ghost" size="sm" class="rounded-full px-3">
                      <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ t('myPosts.view') }}
                    </Button>
                  </RouterLink>
                  <RouterLink :to="`/me/posts/${post.slug}/edit`">
                    <Button variant="outline" size="sm" class="rounded-full px-3">
                      <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ t('myPosts.edit') }}
                    </Button>
                  </RouterLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="rounded-full px-3 text-destructive hover:text-destructive"
                    @click="destroy(post.publicId, post.slug)"
                  >
                    <svg class="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ t('myPosts.delete') }}
                  </Button>
                </div>
              </div>
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
          <p class="text-sm font-medium">{{ t('myPosts.empty') }}</p>
          <p class="text-xs text-muted-foreground">{{ t('myPosts.emptyDesc') }}</p>
        </div>
        <RouterLink to="/me/posts/new">
          <Button size="sm">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('myPosts.writeFirst') }}
          </Button>
        </RouterLink>
      </div>

    </main>
  </AppLayout>
</template>
