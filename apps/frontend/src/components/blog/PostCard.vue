<script setup lang="ts">
import { computed } from "vue";
import type { PostSummary } from "@/api/blog.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
</script>

<template>
  <Card class="flex h-full flex-col overflow-hidden border-border/70 shadow-sm">
    <div
      class="h-40 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-background"
      :style="
        props.post.coverImage
          ? { backgroundImage: `url(${props.post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      "
    />
    <CardHeader class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <Badge variant="outline" class="capitalize">
          {{ props.post.status }}
        </Badge>
        <span class="text-xs text-muted-foreground">{{ publishedLabel }}</span>
      </div>
      <div class="space-y-1">
        <CardTitle class="text-xl leading-tight">{{ props.post.title }}</CardTitle>
        <CardDescription class="line-clamp-3 text-sm leading-6">
          {{ previewText }}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent class="flex-1">
      <p class="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {{ props.post.slug }}
      </p>
    </CardContent>
    <CardFooter class="pt-0">
      <RouterLink :to="`/blog/${props.post.slug}`" class="w-full">
        <Button class="w-full justify-between" variant="outline">
          <span>Read article</span>
          <span aria-hidden="true">→</span>
        </Button>
      </RouterLink>
    </CardFooter>
  </Card>
</template>
