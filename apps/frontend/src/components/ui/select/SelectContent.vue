<script setup lang="ts">
import {
	SelectContent,
	type SelectContentProps,
	SelectPortal,
	SelectViewport,
} from "reka-ui";
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
      :align-offset="props.alignOffset"
      :avoid-collisions="props.avoidCollisions"
      :collision-boundary="props.collisionBoundary"
      :collision-padding="props.collisionPadding"
      :position-strategy="props.positionStrategy"
      :update-position-strategy="props.updatePositionStrategy"
      :class="cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        props.class
      )"
    >
      <SelectViewport
        :class="
          cn(
            'p-1',
            props.position !== 'item-aligned' &&
              'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)] scroll-my-1'
          )
        "
      >
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
