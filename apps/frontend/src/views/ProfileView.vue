<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { getMe, type Profile, uploadAvatar } from "@/api/auth";
import AppNav from "@/components/AppNav.vue";
import EditProfileDialog from "@/components/EditProfileDialog.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";

const queryClient = useQueryClient();
const avatarInputRef = ref<HTMLInputElement | null>(null);
const editOpen = ref(false);

function onProfileSaved(updated: Profile) {
	queryClient.setQueryData(["me"], updated);
	editOpen.value = false;
}

const {
	data: profile,
	isPending,
	isError,
} = useQuery({
	queryKey: ["me"],
	queryFn: getMe,
});

const { mutate: doUploadAvatar, isPending: isUploadingAvatar } = useMutation({
	mutationFn: uploadAvatar,
	onSuccess(updated) {
		queryClient.setQueryData(["me"], updated);
		toast.success("Avatar updated");
	},
	onError(err) {
		toast.error("Failed to update avatar", { description: err.message });
	},
});

function onAvatarClick() {
	avatarInputRef.value?.click();
}

function onAvatarFileChange(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (!file) return;
	doUploadAvatar(file);
	(e.target as HTMLInputElement).value = "";
}

function getFirstCharacter(value: string | null | undefined) {
	return value?.charAt(0) ?? "";
}

const initials = computed(() => {
	if (!profile.value) return "?";
	const f = getFirstCharacter(profile.value.firstName);
	const l = getFirstCharacter(profile.value.lastName);
	return (
		(f + l).toUpperCase() ||
		getFirstCharacter(profile.value.email).toUpperCase()
	);
});

const fullName = computed(() =>
	profile.value
		? `${profile.value.firstName} ${profile.value.lastName}`.trim() ||
			profile.value.email
		: "",
);

const joinedDate = computed(() => {
	if (!profile.value) return "";
	return new Date(profile.value.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppNav />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- Loading -->
      <div v-if="isPending" class="flex flex-col items-center justify-center py-24 gap-4">
        <svg class="animate-spin h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-muted-foreground">Loading profile…</p>
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
        <p class="text-sm font-medium text-destructive">Failed to load profile</p>
        <p class="text-xs text-muted-foreground">Please refresh the page or sign in again.</p>
      </div>

      <!-- Profile -->
      <template v-else-if="profile">

        <!-- Hero card -->
        <Card class="overflow-hidden">
          <div class="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
          <CardContent class="px-6 pb-6 -mt-10">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

              <!-- Avatar (clickable upload) -->
              <div
                class="relative w-20 h-20 rounded-2xl bg-primary border-4 border-card shadow-sm flex items-center justify-center shrink-0 cursor-pointer group"
                :class="{ 'opacity-70': isUploadingAvatar }"
                @click="onAvatarClick"
              >
                <img v-if="profile.avatar" :src="profile.avatar" :alt="fullName" class="w-full h-full rounded-xl object-cover" />
                <span v-else class="text-primary-foreground font-bold text-2xl">{{ initials }}</span>

                <div class="absolute inset-0 rounded-xl bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg v-if="!isUploadingAvatar" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span class="text-white text-[10px] mt-1 font-medium">
                    {{ isUploadingAvatar ? 'Uploading…' : 'Change' }}
                  </span>
                </div>

                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="hidden"
                  @change="onAvatarFileChange"
                />
              </div>

              <div class="flex items-center gap-2 pb-1">
                <Badge variant="secondary" class="text-xs">
                  <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3" stroke-linecap="round"/>
                  </svg>
                  Joined {{ joinedDate }}
                </Badge>
                <Button size="sm" variant="outline" class="text-xs h-7" @click="editOpen = true">
                  <svg class="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Edit profile
                </Button>
              </div>
            </div>

            <div class="mt-4 space-y-1">
              <h1 class="text-2xl font-bold tracking-tight">{{ fullName }}</h1>
              <p class="text-sm text-muted-foreground">{{ profile.email }}</p>
              <p v-if="profile.bio" class="text-sm text-foreground/80 mt-2 max-w-lg">{{ profile.bio }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Quick actions -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RouterLink to="/me/posts/new" class="group">
            <Card class="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent class="p-5 flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold">New post</p>
                  <p class="text-xs text-muted-foreground">Write something new</p>
                </div>
              </CardContent>
            </Card>
          </RouterLink>

          <RouterLink to="/me/posts" class="group">
            <Card class="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent class="p-5 flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                  <svg class="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold">My posts</p>
                  <p class="text-xs text-muted-foreground">Manage your writing</p>
                </div>
              </CardContent>
            </Card>
          </RouterLink>

          <RouterLink to="/me/bookmarks" class="group">
            <Card class="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent class="p-5 flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-muted/80 transition-colors">
                  <svg class="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold">Bookmarks</p>
                  <p class="text-xs text-muted-foreground">Saved articles</p>
                </div>
              </CardContent>
            </Card>
          </RouterLink>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Contact -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium flex items-center gap-2">
                <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Contact info
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground">Email</p>
                  <p class="text-sm font-medium truncate">{{ profile.email }}</p>
                </div>
              </div>

              <Separator />

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.9a16 16 0 0 0 6.72 6.72l.58-.36a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground">Phone</p>
                  <p class="text-sm font-medium">{{ profile.phone || "—" }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Account -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium flex items-center gap-2">
                <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Account details
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground">First name</p>
                  <p class="text-sm font-medium">{{ profile.firstName || "—" }}</p>
                </div>
              </div>

              <Separator />

              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted-foreground">Last name</p>
                  <p class="text-sm font-medium">{{ profile.lastName || "—" }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Bio card - full width if bio exists -->
          <Card v-if="profile.bio" class="sm:col-span-2">
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium flex items-center gap-2">
                <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="10 9 9 9 8 9" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-foreground/80 leading-relaxed">{{ profile.bio }}</p>
            </CardContent>
          </Card>
        </div>

      </template>
    </main>
  </div>

  <EditProfileDialog
    v-if="profile"
    :open="editOpen"
    :profile="profile"
    @close="editOpen = false"
    @saved="onProfileSaved"
  />
</template>
