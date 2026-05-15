<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { listCategories } from "@/api/categories";
import { listTags } from "@/api/tags";
import type { Category, Tag } from "@/api/blog.types";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
	modelValue: {
		categoryId?: string;
		tagId?: string;
	};
}>();

const emit = defineEmits<{
	"update:modelValue": [value: { categoryId?: string; tagId?: string }];
}>();

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

onMounted(async () => {
	[categories.value, tags.value] = await Promise.all([
		listCategories(),
		listTags(),
	]);
});

const hasFilters = computed(
	() => !!props.modelValue.categoryId || !!props.modelValue.tagId,
);

function updateCategory(value: string) {
	emit("update:modelValue", {
		...props.modelValue,
		categoryId: value === "__all__" ? undefined : value,
	});
}

function updateTag(value: string) {
	emit("update:modelValue", {
		...props.modelValue,
		tagId: value === "__all__" ? undefined : value,
	});
}

function clearFilters() {
	emit("update:modelValue", {});
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <!-- Category select -->
    <div class="space-y-1.5 min-w-[180px]">
      <label class="text-xs font-medium text-muted-foreground">Category</label>
      <Select
        :model-value="props.modelValue.categoryId ?? '__all__'"
        @update:model-value="updateCategory"
      >
        <SelectTrigger class="h-9">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All categories</SelectItem>
          <SelectItem
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Tag select -->
    <div class="space-y-1.5 min-w-[180px]">
      <label class="text-xs font-medium text-muted-foreground">Tag</label>
      <Select
        :model-value="props.modelValue.tagId ?? '__all__'"
        @update:model-value="updateTag"
      >
        <SelectTrigger class="h-9">
          <SelectValue placeholder="All tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All tags</SelectItem>
          <SelectItem
            v-for="tag in tags"
            :key="tag.id"
            :value="tag.id"
          >
            {{ tag.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Clear button with trash icon -->
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
      :disabled="!hasFilters"
      :title="hasFilters ? 'Clear filters' : 'No active filters'"
      @click="clearFilters"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </Button>
  </div>
</template>
