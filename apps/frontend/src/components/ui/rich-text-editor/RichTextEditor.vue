<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { watch } from "vue";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "Start writing…",
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: "min-h-[280px] px-4 py-4 text-sm leading-7 outline-none focus:outline-none prose prose-sm max-w-none",
    },
  },
  onUpdate({ editor }) {
    const html = editor.getHTML();
    emit("update:modelValue", html === "<p></p>" ? "" : html);
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const current = editor.value.getHTML();
    const incoming = value ?? "";
    if (current !== incoming) {
      editor.value.commands.setContent(incoming, false);
    }
  },
);

watch(
  () => props.disabled,
  (value) => {
    editor.value?.setEditable(!value);
  },
);
</script>

<template>
  <div
    class="rounded-md border border-input bg-background overflow-hidden"
    :class="{ 'opacity-60 pointer-events-none': disabled }"
  >
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      <!-- Text format -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('bold') }"
        title="Bold (Ctrl+B)"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('italic') }"
        title="Italic (Ctrl+I)"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="4" x2="10" y2="4" stroke-linecap="round"/>
          <line x1="14" y1="20" x2="5" y2="20" stroke-linecap="round"/>
          <line x1="15" y1="4" x2="9" y2="20" stroke-linecap="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('underline') }"
        title="Underline (Ctrl+U)"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="4" y1="21" x2="20" y2="21" stroke-linecap="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('strike') }"
        title="Strikethrough"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M16 4H9a3 3 0 0 0-2.83 4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 12a4 4 0 0 1 0 8H6" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round"/>
        </svg>
      </Button>

      <Separator orientation="vertical" class="h-5 mx-1" />

      <!-- Headings -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7 text-xs font-bold"
        :class="{ 'bg-muted text-foreground': editor?.isActive('heading', { level: 1 }) }"
        title="Heading 1"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7 text-xs font-bold"
        :class="{ 'bg-muted text-foreground': editor?.isActive('heading', { level: 2 }) }"
        title="Heading 2"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7 text-xs font-bold"
        :class="{ 'bg-muted text-foreground': editor?.isActive('heading', { level: 3 }) }"
        title="Heading 3"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </Button>

      <Separator orientation="vertical" class="h-5 mx-1" />

      <!-- Lists -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('bulletList') }"
        title="Bullet list"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
          <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
          <circle cx="3" cy="6" r="1" fill="currentColor"/>
          <circle cx="3" cy="12" r="1" fill="currentColor"/>
          <circle cx="3" cy="18" r="1" fill="currentColor"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('orderedList') }"
        title="Ordered list"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="10" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="10" y1="12" x2="21" y2="12" stroke-linecap="round"/>
          <line x1="10" y1="18" x2="21" y2="18" stroke-linecap="round"/>
          <path d="M4 6h1v4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 10h2" stroke-linecap="round"/>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>

      <Separator orientation="vertical" class="h-5 mx-1" />

      <!-- Align -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive({ textAlign: 'left' }) }"
        title="Align left"
        @click="editor?.chain().focus().setTextAlign('left').run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="3" y1="12" x2="15" y2="12" stroke-linecap="round"/>
          <line x1="3" y1="18" x2="18" y2="18" stroke-linecap="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive({ textAlign: 'center' }) }"
        title="Align center"
        @click="editor?.chain().focus().setTextAlign('center').run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="6" y1="12" x2="18" y2="12" stroke-linecap="round"/>
          <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive({ textAlign: 'right' }) }"
        title="Align right"
        @click="editor?.chain().focus().setTextAlign('right').run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="9" y1="12" x2="21" y2="12" stroke-linecap="round"/>
          <line x1="6" y1="18" x2="21" y2="18" stroke-linecap="round"/>
        </svg>
      </Button>

      <Separator orientation="vertical" class="h-5 mx-1" />

      <!-- Block -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('blockquote') }"
        title="Blockquote"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('code') }"
        title="Inline code"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="8 6 2 12 8 18" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-muted text-foreground': editor?.isActive('codeBlock') }"
        title="Code block"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke-linecap="round"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke-linecap="round"/>
        </svg>
      </Button>

      <Separator orientation="vertical" class="h-5 mx-1" />

      <!-- History -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!editor?.can().undo()"
        title="Undo (Ctrl+Z)"
        @click="editor?.chain().focus().undo().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!editor?.can().redo()"
        title="Redo (Ctrl+Y)"
        @click="editor?.chain().focus().redo().run()"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 7v6h-6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Button>
    </div>

    <!-- Editor area -->
    <EditorContent :editor="editor" />
  </div>
</template>

