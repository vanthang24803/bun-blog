<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type {
	Category,
	CreatePostInput,
	PostSubmitPayload,
	Tag,
	UpdatePostInput,
} from "@/api/blog.types";
import { listCategories } from "@/api/categories";
import { listTags } from "@/api/tags";
import PostFormSkeleton from "@/components/blog/PostFormSkeleton.vue";
import TagBadge from "@/components/blog/TagBadge.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor/RichTextEditor.vue";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type FormShape = {
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	coverImage: string;
	categoryId: string;
	tagIds: string[];
	status: "draft" | "published" | "archived";
};

const props = withDefaults(
	defineProps<{
		initialValues?: Partial<CreatePostInput & UpdatePostInput> & {
			tagIds?: string[];
		};
		loading?: boolean;
		submitLabel?: string;
	}>(),
	{
		initialValues: undefined,
		loading: false,
		submitLabel: "Save post",
	},
);

const emit = defineEmits<{
	submit: [value: PostSubmitPayload];
}>();

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);
const slugTouched = ref(Boolean(props.initialValues?.slug));
const coverInputRef = ref<HTMLInputElement | null>(null);
const coverFile = ref<File | null>(null);
const coverPreviewUrl = ref("");
const isDraggingCover = ref(false);
const isBootstrapping = ref(true);

const form = reactive<FormShape>({
	title: "",
	slug: "",
	content: "",
	excerpt: "",
	coverImage: "",
	categoryId: "",
	tagIds: [],
	status: "draft",
});

const VI_MAP: Record<string, string> = {
	à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
	ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
	â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
	è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
	ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
	ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
	ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
	ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
	ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
	ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
	ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
	ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
	đ: "d",
};

function slugify(value: string) {
	const transliterated = value
		.toLowerCase()
		.trim()
		.split("")
		.map((ch) => VI_MAP[ch] ?? ch)
		.join("")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "");

	const slug = transliterated
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	// If nothing survived (e.g. pure Japanese title), append a short random suffix
	return slug || `post-${Math.random().toString(36).slice(2, 8)}`;
}

function hydrateForm(
	values?: Partial<CreatePostInput & UpdatePostInput> & { tagIds?: string[] },
) {
	form.title = values?.title ?? "";
	form.slug = values?.slug ?? "";
	form.content = values?.content ?? "";
	form.excerpt = values?.excerpt ?? "";
	form.coverImage = values?.coverImage ?? "";
	form.categoryId = values?.categoryId ?? "";
	form.tagIds = values?.tagIds ? [...values.tagIds] : [];
	form.status = values?.status ?? "draft";
}

watch(
	() => props.initialValues,
	(values) => {
		hydrateForm(values);
		slugTouched.value = Boolean(values?.slug);
		if (coverPreviewUrl.value) {
			URL.revokeObjectURL(coverPreviewUrl.value);
			coverPreviewUrl.value = "";
		}
		coverFile.value = null;
	},
	{ immediate: true },
);

watch(
	() => form.title,
	(value) => {
		if (!slugTouched.value) form.slug = slugify(value);
	},
);

onMounted(async () => {
	try {
		[categories.value, tags.value] = await Promise.all([
			listCategories(),
			listTags(),
		]);
	} finally {
		isBootstrapping.value = false;
	}
});

onUnmounted(() => {
	if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value);
});

const activeCoverPreview = computed(
	() => coverPreviewUrl.value || form.coverImage,
);

function toggleTag(tagId: string) {
	form.tagIds = form.tagIds.includes(tagId)
		? form.tagIds.filter((value) => value !== tagId)
		: [...form.tagIds, tagId];
}

function openCoverPicker() {
	coverInputRef.value?.click();
}

function applyCoverFile(file?: File | null) {
	if (!file) return;

	if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value);
	coverFile.value = file;
	coverPreviewUrl.value = URL.createObjectURL(file);
}

function onCoverFileChange(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];
	applyCoverFile(file);
	(event.target as HTMLInputElement).value = "";
}

function onCoverDragEnter() {
	isDraggingCover.value = true;
}

function onCoverDragLeave(event: DragEvent) {
	const nextTarget = event.relatedTarget;
	if (nextTarget instanceof Node && event.currentTarget instanceof Node) {
		if (event.currentTarget.contains(nextTarget)) return;
	}
	isDraggingCover.value = false;
}

function onCoverDrop(event: DragEvent) {
	isDraggingCover.value = false;
	const file = event.dataTransfer?.files?.[0];
	applyCoverFile(file);
}

function handleSubmit() {
	const payload: CreatePostInput | UpdatePostInput = {
		title: form.title.trim(),
		slug: form.slug.trim(),
		content: form.content.trim(),
		status: form.status,
	};

	if (form.excerpt.trim()) payload.excerpt = form.excerpt.trim();
	if (form.coverImage.trim()) payload.coverImage = form.coverImage.trim();
	if (form.categoryId && form.categoryId !== "__none__")
		payload.categoryId = form.categoryId;
	if (form.tagIds.length) payload.tagIds = [...form.tagIds];

	emit("submit", { payload, coverFile: coverFile.value });
}
</script>

<template>
  <PostFormSkeleton v-if="isBootstrapping" />

  <form v-else class="space-y-6" @submit.prevent="handleSubmit">

    <!-- Title + Slug -->
    <div class="grid gap-5 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="title">Title <span class="text-destructive">*</span></Label>
        <Input
          id="title"
          v-model="form.title"
          placeholder="A sharp title for your post"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="slug">Slug <span class="text-destructive">*</span></Label>
        <Input
          id="slug"
          v-model="form.slug"
          placeholder="auto-generated-slug"
          required
          @input="slugTouched = true"
        />
      </div>
    </div>

    <!-- Status + Category + Cover -->
    <div class="grid gap-5 md:grid-cols-3">
      <div class="space-y-2">
        <Label>Status</Label>
        <Select v-model="form.status">
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-muted-foreground inline-block" />
                Draft
              </span>
            </SelectItem>
            <SelectItem value="published">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-green-500 inline-block" />
                Published
              </span>
            </SelectItem>
            <SelectItem value="archived">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-orange-400 inline-block" />
                Archived
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>Category</Label>
        <Select
          :model-value="form.categoryId || '__none__'"
          @update:model-value="(v) => (form.categoryId = v === '__none__' ? '' : v)"
        >
          <SelectTrigger>
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No category</SelectItem>
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

      <div class="space-y-2 md:col-span-3">
        <Label>Cover image</Label>
        <input
          ref="coverInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="hidden"
          @change="onCoverFileChange"
        />

        <button
          type="button"
          class="block w-full rounded-xl border border-dashed p-4 text-left transition-colors"
          :class="
            isDraggingCover
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50'
          "
          @click="openCoverPicker"
          @dragenter.prevent="onCoverDragEnter"
          @dragover.prevent="isDraggingCover = true"
          @dragleave.prevent="onCoverDragLeave"
          @drop.prevent="onCoverDrop"
        >
          <div
            v-if="activeCoverPreview"
            class="overflow-hidden rounded-lg border border-border bg-card"
          >
            <img
              :src="activeCoverPreview"
              alt="Cover preview"
              class="h-44 w-full object-cover"
            />
          </div>
          <div
            v-else
            class="flex h-44 items-center justify-center rounded-lg border border-border bg-background text-sm text-muted-foreground"
          >
            No cover image selected
          </div>

          <p class="mt-3 text-xs text-muted-foreground">
            {{
              coverFile
                ? `${coverFile.name} will be uploaded when you submit.`
                : "Click or drag and drop a jpeg, png, webp, or gif file here. The image is sent to S3 only on submit."
            }}
          </p>
        </button>
      </div>
    </div>

    <!-- Excerpt -->
    <div class="space-y-2">
      <Label for="excerpt">Excerpt</Label>
      <textarea
        id="excerpt"
        v-model="form.excerpt"
        rows="2"
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
        placeholder="Short teaser shown on cards and search results"
      />
    </div>

    <!-- Tags -->
    <div class="space-y-2">
      <Label>Tags</Label>
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          clickable
          :active="form.tagIds.includes(tag.id)"
          @click="toggleTag(tag.id)"
        />
        <span v-if="!tags.length" class="text-xs text-muted-foreground">Loading tags…</span>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <Label>Content <span class="text-destructive">*</span></Label>
      <RichTextEditor
        v-model="form.content"
        placeholder="Write the full article here…"
        :disabled="loading"
      />
    </div>

    <!-- Submit -->
    <div class="flex justify-end pt-2">
      <Button type="submit" :disabled="loading">
        <svg v-if="loading" class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        {{ loading ? "Saving…" : submitLabel }}
      </Button>
    </div>
  </form>
</template>
