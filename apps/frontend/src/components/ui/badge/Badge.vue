<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				secondary: "border-transparent bg-secondary text-secondary-foreground",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground",
				outline: "text-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

const props = withDefaults(
	defineProps<{ variant?: BadgeVariants["variant"]; class?: string }>(),
	{ variant: "default" },
);
</script>

<template>
  <span :class="cn(badgeVariants({ variant: props.variant }), props.class)">
    <slot />
  </span>
</template>
