<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useMutation, useQuery } from "@tanstack/vue-query";
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuRoot,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "reka-ui";
import { getMe, logout } from "@/api/auth";
import UserAvatar from "@/components/ui/avatar/UserAvatar.vue";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { toast } from "@/components/ui/sonner";

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const {
	data: profile,
} = useQuery({
	queryKey: ["me"],
	queryFn: getMe,
	enabled: isLoggedIn,
});

const avatarLabel = computed(() => {
	const currentProfile = profile.value;
	if (!currentProfile) return "U";

	const nameInitials = `${currentProfile.firstName?.[0] ?? ""}${currentProfile.lastName?.[0] ?? ""}`
		.trim()
		.toUpperCase();

	return nameInitials || currentProfile.email[0]?.toUpperCase() || "U";
});

const { mutate: doLogout, isPending: isLoggingOut } = useMutation({
	mutationFn: logout,
	onSettled() {
		authStore.clear();
		toast.info("Signed out");
		router.push("/login");
	},
});

function goToProfile() {
	router.push("/me");
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border bg-card">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      <!-- Logo -->
      <RouterLink to="/blog" class="flex items-center gap-2 shrink-0">
        <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span class="text-primary-foreground font-bold text-sm">M</span>
        </div>
        <span class="font-semibold text-sm">Blogs</span>
      </RouterLink>

      <!-- Nav links -->
      <nav class="flex items-center gap-1">
        <RouterLink to="/blog" custom v-slot="{ isActive, navigate }">
          <Button
            variant="ghost"
            size="sm"
            :class="isActive ? 'text-foreground bg-muted' : 'text-muted-foreground'"
            @click="navigate"
          >
            <svg class="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Blog
          </Button>
        </RouterLink>

        <template v-if="isLoggedIn">
          <RouterLink to="/me/posts" custom v-slot="{ isActive, navigate }">
            <Button
              variant="ghost"
              size="sm"
              :class="isActive ? 'text-foreground bg-muted' : 'text-muted-foreground'"
              @click="navigate"
            >
              <svg class="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              My Posts
            </Button>
          </RouterLink>

          <RouterLink to="/me/bookmarks" custom v-slot="{ isActive, navigate }">
            <Button
              variant="ghost"
              size="sm"
              :class="isActive ? 'text-foreground bg-muted' : 'text-muted-foreground'"
              @click="navigate"
            >
              <svg class="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Bookmarks
            </Button>
          </RouterLink>
        </template>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="isLoggedIn">
          <DropdownMenuRoot>
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="rounded-full transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Open account menu"
              >
                <UserAvatar size="md" :src="profile?.avatar" :initials="avatarLabel" alt="Profile avatar" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent
                :side-offset="10"
                align="end"
                class="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg"
              >
                <div class="px-3 py-2">
                  <p class="text-sm font-medium leading-none">
                    {{ profile ? `${profile.firstName} ${profile.lastName}`.trim() || profile.email : "Account" }}
                  </p>
                  <p v-if="profile?.email" class="mt-1 text-xs text-muted-foreground">
                    {{ profile.email }}
                  </p>
                </div>

                <DropdownMenuSeparator class="my-1 h-px bg-border" />

                <DropdownMenuItem
                  class="flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition focus:bg-accent focus:text-accent-foreground"
                  @select="goToProfile"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  :disabled="isLoggingOut"
                  class="flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  @select="doLogout()"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="16 17 21 12 16 7" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ isLoggingOut ? "Signing out..." : "Sign out" }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </RouterLink>
          <RouterLink to="/register">
            <Button size="sm">Sign up</Button>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
