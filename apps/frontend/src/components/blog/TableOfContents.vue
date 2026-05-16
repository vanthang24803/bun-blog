<script setup lang="ts">
import { computed } from "vue";
import type { TocHeading } from "@/composables/useToc";

const props = defineProps<{
	headings: TocHeading[];
	activeId: string;
}>();

const emit = defineEmits<{ select: [id: string] }>();

// Normalize indent: offset by the minimum level found
const minLevel = computed(() =>
	props.headings.length ? Math.min(...props.headings.map((h) => h.level)) : 2,
);

const indentClass: Record<number, string> = {
	0: "pl-0",
	1: "pl-3",
	2: "pl-5",
	3: "pl-7",
};

function indent(level: number) {
	return indentClass[Math.min(level - minLevel.value, 3)] ?? "pl-7";
}
</script>

<template>
  <nav v-if="headings.length" aria-label="Table of contents">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      On this page
    </p>

    <ul class="space-y-0.5">
      <li v-for="h in headings" :key="h.id" :class="indent(h.level)">
        <button
          type="button"
          class="w-full text-left py-1 pr-2 text-[13px] leading-snug transition-colors duration-150 border-l-2"
          :class="
            h.id === activeId
              ? 'border-primary text-foreground font-medium pl-3'
              : 'border-transparent text-muted-foreground hover:text-foreground pl-3'
          "
          @click="emit('select', h.id)"
        >
          {{ h.text }}
        </button>
      </li>
    </ul>
  </nav>
</template>
