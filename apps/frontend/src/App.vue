<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView, useRouter } from "vue-router";
import UISettingsDialog from "@/components/UISettingsDialog.vue";
import { Toaster, toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
useUIStore(); // boot: applies persisted dark mode, fonts, accent color

const settingsOpen = ref(false);

function onAuthExpired() {
	authStore.clear();
	toast.error(t("auth.sessionExpired"), {
		description: t("auth.sessionExpiredDesc"),
	});
	router.push("/login");
}

onMounted(() => {
	window.addEventListener("auth:expired", onAuthExpired);
});

onUnmounted(() => {
	window.removeEventListener("auth:expired", onAuthExpired);
});
</script>

<template>
  <RouterView />
  <Toaster />

  <!-- Floating settings button -->
  <button
    type="button"
    class="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground hover:shadow-xl"
    :aria-label="t('settings.title')"
    @click="settingsOpen = true"
  >
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <UISettingsDialog v-model:open="settingsOpen" />
</template>
