<script setup lang="ts">
import { Badge } from "@/components/ui/badge";

const props = withDefaults(
	defineProps<{
		label: string;
		clickable?: boolean;
		active?: boolean;
	}>(),
	{
		clickable: false,
		active: false,
	},
);

const emit = defineEmits<{
	click: [];
}>();
</script>

<template>
  <button
    v-if="props.clickable"
    type="button"
    class="transition-transform hover:-translate-y-0.5"
    @click="emit('click')"
  >
    <Badge :variant="props.active ? 'default' : 'secondary'" class="cursor-pointer">
      {{ props.label }}
    </Badge>
  </button>
  <Badge v-else variant="secondary">
    {{ props.label }}
  </Badge>
</template>
