<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string | null;
    initials?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    alt?: string;
  }>(),
  { size: "md", initials: "?", alt: "Avatar" },
);

const sizeClass: Record<string, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};
</script>

<template>
  <div
    class="relative rounded-full bg-primary shrink-0 overflow-hidden flex items-center justify-center select-none"
    :class="sizeClass[size]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      draggable="false"
    />
    <span v-else class="font-semibold text-primary-foreground leading-none">
      {{ initials }}
    </span>
    <slot />
  </div>
</template>
