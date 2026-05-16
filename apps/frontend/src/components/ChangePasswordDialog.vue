<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { changePassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

const form = reactive({
	oldPassword: "",
	newPassword: "",
	confirmNewPassword: "",
});

const formError = ref("");

function resetForm() {
	form.oldPassword = "";
	form.newPassword = "";
	form.confirmNewPassword = "";
	formError.value = "";
}

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) {
			resetForm();
		}
	},
);

const confirmMismatch = computed(
	() =>
		!!form.confirmNewPassword && form.newPassword !== form.confirmNewPassword,
);

const sameAsOld = computed(
	() => !!form.oldPassword && form.oldPassword === form.newPassword,
);

const canSubmit = computed(
	() =>
		!!form.oldPassword &&
		!!form.newPassword &&
		!!form.confirmNewPassword &&
		form.newPassword.length >= 6 &&
		!confirmMismatch.value &&
		!sameAsOld.value,
);

const { mutate, isPending } = useMutation({
	mutationFn: changePassword,
	onSuccess() {
		toast.success(t("profile.passwordChanged"));
		resetForm();
		emit("close");
	},
	onError(err) {
		toast.error(t("profile.passwordChangeFailed"), {
			description: err.message,
		});
	},
});

function onSubmit() {
	if (confirmMismatch.value) {
		formError.value = t("auth.passwordMismatch");
		return;
	}
	if (sameAsOld.value) {
		formError.value = t("profile.newPasswordDifferent");
		return;
	}

	formError.value = "";
	mutate({
		oldPassword: form.oldPassword,
		newPassword: form.newPassword,
		confirmNewPassword: form.confirmNewPassword,
	});
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="emit('close')"
      >
        <div class="absolute inset-0 bg-black/55 backdrop-blur-sm" @click="emit('close')" />

        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="open"
            class="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
            role="dialog"
            aria-modal="true"
            :aria-label="t('profile.changePassword')"
          >
            <div class="border-b border-border bg-gradient-to-r from-primary/8 via-primary/4 to-background px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <h2 class="text-base font-semibold tracking-tight">{{ t("profile.changePassword") }}</h2>
                  <p class="text-sm text-muted-foreground">
                    {{ t("profile.changePasswordDesc") }}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  :aria-label="t('common.close')"
                  @click="emit('close')"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <form class="space-y-4 px-6 py-5" @submit.prevent="onSubmit">
              <div class="space-y-1.5">
                <Label for="cp-old">{{ t("profile.oldPassword") }}</Label>
                <Input
                  id="cp-old"
                  v-model="form.oldPassword"
                  type="password"
                  autocomplete="current-password"
                  :placeholder="t('profile.oldPasswordPlaceholder')"
                  :disabled="isPending"
                />
              </div>

              <div class="space-y-1.5">
                <Label for="cp-new">{{ t("profile.newPassword") }}</Label>
                <Input
                  id="cp-new"
                  v-model="form.newPassword"
                  type="password"
                  autocomplete="new-password"
                  :placeholder="t('profile.newPasswordPlaceholder')"
                  :disabled="isPending"
                />
                <p class="text-xs text-muted-foreground">{{ t("auth.minPassword") }}</p>
              </div>

              <div class="space-y-1.5">
                <Label for="cp-confirm">{{ t("profile.confirmNewPassword") }}</Label>
                <Input
                  id="cp-confirm"
                  v-model="form.confirmNewPassword"
                  type="password"
                  autocomplete="new-password"
                  :placeholder="t('profile.confirmNewPasswordPlaceholder')"
                  :disabled="isPending"
                />
              </div>

              <div
                v-if="formError || confirmMismatch || sameAsOld"
                class="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {{
                  formError ||
                  (confirmMismatch
                    ? t("auth.passwordMismatch")
                    : t("profile.newPasswordDifferent"))
                }}
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  :disabled="isPending"
                  @click="emit('close')"
                >
                  {{ t("common.cancel") }}
                </Button>
                <Button
                  type="submit"
                  :disabled="isPending || !canSubmit"
                  class="min-w-36"
                >
                  <svg
                    v-if="isPending"
                    class="mr-1.5 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {{ isPending ? t("profile.changingPassword") : t("profile.changePasswordAction") }}
                </Button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
