<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
	ACCENT_PRESETS,
	type AccentColor,
	KANJI_FONT_OPTIONS,
	type KanjiFont,
	type Language,
	UI_FONT_OPTIONS,
	type UIFont,
	useUIStore,
} from "@/stores/ui";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const { t } = useI18n();
const ui = useUIStore();

function close() {
	emit("update:open", false);
}

const languages: { value: Language; label: string; flag: string }[] = [
	{ value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
	{ value: "en", label: "English", flag: "🇺🇸" },
	{ value: "ja", label: "日本語", flag: "🇯🇵" },
];

const accentKeys = computed(() => Object.keys(ACCENT_PRESETS) as AccentColor[]);
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
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60" @click="close" />

        <!-- Panel -->
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card text-card-foreground shadow-2xl"
          >
            <!-- Header -->
            <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 class="text-base font-semibold">{{ t('settings.title') }}</h2>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  @click="ui.reset()"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ t('settings.reset') }}
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  @click="close"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="space-y-6 p-5">

              <!-- Ngôn ngữ -->
              <section class="space-y-3">
                <p class="text-sm font-medium">{{ t('settings.language') }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="lang in languages"
                    :key="lang.value"
                    type="button"
                    class="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition"
                    :class="ui.language === lang.value
                      ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/50'"
                    @click="ui.language = lang.value"
                  >
                    <span class="text-base">{{ lang.flag }}</span>
                    <span class="font-medium">{{ lang.label }}</span>
                  </button>
                </div>
              </section>

              <!-- Chế độ tối -->
              <section>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium">{{ t('settings.darkMode') }}</p>
                    <p class="text-xs text-muted-foreground">{{ t('settings.darkModeDesc') }}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="ui.darkMode"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    :class="ui.darkMode ? 'bg-primary' : 'bg-input'"
                    @click="ui.darkMode = !ui.darkMode"
                  >
                    <span
                      class="pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200"
                      :class="ui.darkMode ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </section>

              <!-- Màu chủ đạo -->
              <section class="space-y-3">
                <p class="text-sm font-medium">{{ t('settings.accentColor') }}</p>
                <div class="flex items-center gap-3">
                  <button
                    v-for="key in accentKeys"
                    :key="key"
                    type="button"
                    class="h-8 w-8 rounded-full transition-all duration-150 hover:scale-110 focus:outline-none"
                    :style="{
                      backgroundColor: ACCENT_PRESETS[key].display,
                      outline: ui.accentColor === key ? `2px solid ${ACCENT_PRESETS[key].display}` : '2px solid transparent',
                      outlineOffset: '3px',
                      transform: ui.accentColor === key ? 'scale(1.15)' : undefined,
                    }"
                    :aria-label="key"
                    @click="ui.accentColor = key as AccentColor"
                  />
                </div>
              </section>

              <section class="space-y-3">
                <p class="text-sm font-medium">{{ t('settings.uiFont') }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="opt in UI_FONT_OPTIONS"
                    :key="opt.value"
                    type="button"
                    class="flex flex-col items-start rounded-xl border px-4 py-3 text-left transition"
                    :class="ui.uiFont === opt.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-border/80 hover:bg-muted/50'"
                    @click="ui.uiFont = opt.value as UIFont"
                  >
                    <span class="text-base font-medium leading-none" :style="{ fontFamily: opt.family }">Aa Bb 123</span>
                    <span class="mt-1.5 text-xs text-muted-foreground">{{ opt.label }}</span>
                  </button>
                </div>
              </section>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
