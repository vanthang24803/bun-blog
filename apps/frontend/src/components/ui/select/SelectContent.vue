<script setup lang="ts">
import { SelectContent, SelectPortal, SelectViewport, type SelectContentProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<SelectContentProps & { class?: string }>();
</script>

<template>
  <SelectPortal>
    <SelectContent
      :position="props.position ?? 'popper'"
      :side="props.side"
      :side-offset="props.sideOffset ?? 4"
      :align="props.align"
      :avoid-collisions="props.avoidCollisions"
      :class="cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        props.class
      )"
    >
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
