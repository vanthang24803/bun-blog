<script setup lang="ts">
import AppNav from "@/components/AppNav.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <AppNav />
    <slot />
    <AppFooter />
  </div>
</template>
