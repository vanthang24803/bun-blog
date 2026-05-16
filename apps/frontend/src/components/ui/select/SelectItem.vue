<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText, type SelectItemProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<SelectItemProps & { class?: string }>();
</script>

<template>
  <SelectItem
    :value="props.value"
    :disabled="props.disabled"
    :text-value="props.textValue"
    :class="cn(
      'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0',
      props.class
    )"
  >
    <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
