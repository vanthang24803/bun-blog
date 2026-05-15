<script setup lang="ts">
import { SelectTrigger, type SelectTriggerProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<SelectTriggerProps & { class?: string }>();
</script>

<template>
  <SelectTrigger
    :disabled="props.disabled"
    :as-child="props.asChild"
    :class="cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <slot />
    <svg class="h-4 w-4 opacity-50 shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </SelectTrigger>
</template>
