<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { computed, reactive, watch } from "vue";
import { type Profile, type UpdateProfileBody, updateMe } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const BIO_LIMIT = 200;

const props = defineProps<{ open: boolean; profile: Profile }>();
const emit = defineEmits<{
	close: [];
	saved: [profile: Profile];
}>();

const form = reactive({
	firstName: "",
	lastName: "",
	phone: "",
	bio: "",
});

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			form.firstName = props.profile.firstName ?? "";
			form.lastName = props.profile.lastName ?? "";
			form.phone = props.profile.phone ?? "";
			form.bio = props.profile.bio ?? "";
		}
	},
	{ immediate: true },
);

const bioCount = computed(() => form.bio.length);
const bioOver = computed(() => bioCount.value > BIO_LIMIT);

const { mutate, isPending } = useMutation({
	mutationFn: (body: UpdateProfileBody) => updateMe(body),
	onSuccess(updated) {
		toast.success("Profile updated");
		emit("saved", updated);
	},
	onError(err) {
		toast.error("Failed to update profile", { description: err.message });
	},
});

function onSubmit() {
	if (bioOver.value) return;

	const body: UpdateProfileBody = {};
	if (form.firstName.trim()) body.firstName = form.firstName.trim();
	if (form.lastName.trim()) body.lastName = form.lastName.trim();
	if (form.phone.trim()) body.phone = form.phone.trim();
	body.bio = form.bio.trim();

	mutate(body);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @keydown.esc="emit('close')"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="emit('close')"
      />

      <!-- Panel -->
      <div
        class="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-label="Edit profile"
      >
        <div class="space-y-1">
          <h2 class="text-base font-semibold">Edit profile</h2>
          <p class="text-sm text-muted-foreground">Update your personal information.</p>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <!-- Name row -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="ep-first">First name</Label>
              <Input
                id="ep-first"
                v-model="form.firstName"
                placeholder="First name"
                :disabled="isPending"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="ep-last">Last name</Label>
              <Input
                id="ep-last"
                v-model="form.lastName"
                placeholder="Last name"
                :disabled="isPending"
              />
            </div>
          </div>

          <!-- Phone -->
          <div class="space-y-1.5">
            <Label for="ep-phone">Phone</Label>
            <Input
              id="ep-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+1 234 567 890"
              :disabled="isPending"
            />
          </div>

          <!-- Bio -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <Label for="ep-bio">Bio</Label>
              <span
                class="text-xs tabular-nums"
                :class="bioOver ? 'text-destructive font-medium' : 'text-muted-foreground'"
              >
                {{ bioCount }}/{{ BIO_LIMIT }}
              </span>
            </div>
            <textarea
              id="ep-bio"
              v-model="form.bio"
              rows="3"
              placeholder="Tell us about yourself…"
              :disabled="isPending"
              class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              :class="{ 'border-destructive focus-visible:ring-destructive': bioOver }"
            />
            <p v-if="bioOver" class="text-xs text-destructive">
              Bio must be {{ BIO_LIMIT }} characters or fewer.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              :disabled="isPending"
              @click="emit('close')"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="isPending || bioOver"
            >
              <svg
                v-if="isPending"
                class="animate-spin h-4 w-4 mr-1.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ isPending ? "Saving…" : "Save changes" }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
