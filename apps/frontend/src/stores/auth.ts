import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
	const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
	const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));

	const isLoggedIn = computed(() => !!accessToken.value);

	function setTokens(tokens: { accessToken: string; refreshToken: string }) {
		accessToken.value = tokens.accessToken;
		refreshToken.value = tokens.refreshToken;
		localStorage.setItem("accessToken", tokens.accessToken);
		localStorage.setItem("refreshToken", tokens.refreshToken);
	}

	function clear() {
		accessToken.value = null;
		refreshToken.value = null;
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	}

	return { accessToken, refreshToken, isLoggedIn, setTokens, clear };
});
