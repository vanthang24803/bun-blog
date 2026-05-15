<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import { Toaster, toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

function onAuthExpired() {
	authStore.clear();
	toast.error("Session expired", {
		description: "Please sign in again.",
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
</template>
