<script setup lang="ts">
import { Toaster as Sonner } from "vue-sonner";
import "vue-sonner/style.css";

const props = withDefaults(
	defineProps<{
		position?:
			| "top-left"
			| "top-right"
			| "top-center"
			| "bottom-left"
			| "bottom-right"
			| "bottom-center";
	}>(),
	{ position: "top-right" },
);
</script>

<template>
  <Sonner rich-colors :position="props.position" />
</template>
