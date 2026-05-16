<script setup lang="ts">
import { computed } from "vue";
import type { PostSummary } from "@/api/blog.types";
import UserAvatar from "@/components/ui/avatar/UserAvatar.vue";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const props = defineProps<{
	post: PostSummary;
}>();

const publishedLabel = computed(() => {
	const value = props.post.publishedAt ?? props.post.createdAt;
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
});

const previewText = computed(
	() =>
		props.post.excerpt?.trim() ||
		props.post.content.replace(/\s+/g, " ").slice(0, 140),
);

const authorName = computed(() => {
	const first = props.post.authorFirstName ?? "";
	const last = props.post.authorLastName ?? "";
	return (first + " " + last).trim() || "Anonymous";
});

const authorInitials = computed(() => {
	const first = props.post.authorFirstName?.charAt(0) ?? "";
	const last = props.post.authorLastName?.charAt(0) ?? "";
	return (first + last).toUpperCase() || "?";
});
</script>

<template>
  <RouterLink :to="`/blog/${props.post.slug}`" class="block h-full">
    <Card class="flex h-full flex-col overflow-hidden border-border/70 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-border">
      <!-- Cover image -->
      <div
        class="h-40 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-background"
        :style="
          props.post.coverImage
            ? { backgroundImage: `url(${props.post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        "
      />

      <CardHeader class="space-y-3 pb-2">
        <!-- Author row -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <UserAvatar
              size="xs"
              :src="props.post.authorAvatar ?? undefined"
              :initials="authorInitials"
              :alt="authorName"
            />
            <span class="text-xs font-medium text-foreground truncate">{{ authorName }}</span>
          </div>
          <span class="text-xs text-muted-foreground shrink-0">{{ publishedLabel }}</span>
        </div>

        <!-- Title + excerpt -->
        <div class="space-y-1">
          <CardTitle class="text-xl leading-tight">{{ props.post.title }}</CardTitle>
          <CardDescription class="line-clamp-3 text-sm leading-6">
            {{ previewText }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="flex-1" />

      <!-- Footer: tags + comment count -->
      <div class="px-6 pb-4 flex items-center justify-between gap-2 flex-wrap">
        <!-- Tags -->
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in props.post.tags.slice(0, 3)"
            :key="tag.id"
            class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {{ tag.name }}
          </span>
          <span
            v-if="props.post.tags.length > 3"
            class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            +{{ props.post.tags.length - 3 }}
          </span>
        </div>

        <!-- Comment count -->
        <div class="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ props.post.commentCount }}</span>
        </div>
      </div>
    </Card>
  </RouterLink>
</template>
