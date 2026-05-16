import { defineStore } from "pinia";
import { ref, watch, watchEffect } from "vue";
import { i18n } from "@/i18n";

export type Language = "vi" | "en" | "ja";
export type AccentColor =
	| "blue"
	| "green"
	| "purple"
	| "orange"
	| "red"
	| "pink";
export type KanjiFont =
	| "os"
	| "zen-maru-gothic"
	| "ud-digi-kyokasho"
	| "noto-sans-jp"
	| "itim"
	| "comfortaa";
export type UIFont = "os" | "be-vietnam-pro" | "itim" | "nunito";

const STORAGE_KEY = "ui-settings";

export const ACCENT_PRESETS: Record<
	AccentColor,
	{ display: string; light: string; dark: string; ring: string }
> = {
	blue: {
		display: "#3b82f6",
		light: "oklch(0.48 0.2 250)",
		dark: "oklch(0.72 0.2 250)",
		ring: "oklch(0.58 0.18 250)",
	},
	green: {
		display: "#22c55e",
		light: "oklch(0.48 0.18 145)",
		dark: "oklch(0.72 0.18 145)",
		ring: "oklch(0.58 0.16 145)",
	},
	purple: {
		display: "#a855f7",
		light: "oklch(0.48 0.22 300)",
		dark: "oklch(0.72 0.22 300)",
		ring: "oklch(0.58 0.2 300)",
	},
	orange: {
		display: "#f97316",
		light: "oklch(0.58 0.2 55)",
		dark: "oklch(0.75 0.2 55)",
		ring: "oklch(0.62 0.18 55)",
	},
	red: {
		display: "#ef4444",
		light: "oklch(0.48 0.22 20)",
		dark: "oklch(0.68 0.22 20)",
		ring: "oklch(0.56 0.2 20)",
	},
	pink: {
		display: "#ec4899",
		light: "oklch(0.52 0.22 335)",
		dark: "oklch(0.72 0.22 335)",
		ring: "oklch(0.6 0.2 335)",
	},
};

export const KANJI_FONT_OPTIONS: {
	value: KanjiFont;
	label: string;
	family: string;
}[] = [
		{ value: "os", label: "OS Default", family: "system-ui, sans-serif" },
		{
			value: "zen-maru-gothic",
			label: "Zen Maru Gothic",
			family: "'Zen Maru Gothic', system-ui",
		},
		{
			value: "ud-digi-kyokasho",
			label: "UD Digi Kyokasho",
			family: "'UD Digi Kyokasho N-R', system-ui",
		},
		{
			value: "noto-sans-jp",
			label: "Noto Sans JP",
			family: "'Noto Sans JP', system-ui",
		},
		{ value: "itim", label: "Itim", family: "'Itim', system-ui" },
		{ value: "comfortaa", label: "Comfortaa", family: "'Comfortaa', system-ui" },
	];

export const UI_FONT_OPTIONS: {
	value: UIFont;
	label: string;
	family: string;
}[] = [
		{ value: "os", label: "OS Default", family: "system-ui, sans-serif" },
		{
			value: "be-vietnam-pro",
			label: "Be Vietnam Pro",
			family: "'Be Vietnam Pro', system-ui",
		},
		{ value: "itim", label: "Itim", family: "'Itim', system-ui" },
		{ value: "nunito", label: "Nunito", family: "'Nunito', system-ui" },
	];

const GFONTS: Partial<Record<KanjiFont | UIFont, string>> = {
	"zen-maru-gothic":
		"https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic&display=swap",
	"noto-sans-jp":
		"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
	itim: "https://fonts.googleapis.com/css2?family=Itim&display=swap",
	comfortaa:
		"https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&display=swap",
	"be-vietnam-pro":
		"https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap",
	nunito:
		"https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap",
};

function loadFont(key: string) {
	const url = GFONTS[key as KanjiFont | UIFont];
	if (!url) return;
	const id = `gfont-${key}`;
	if (document.getElementById(id)) return;
	const link = Object.assign(document.createElement("link"), {
		id,
		rel: "stylesheet",
		href: url,
	});
	document.head.appendChild(link);
}

function fromStorage() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
	} catch {
		return {};
	}
}

export const useUIStore = defineStore("ui", () => {
	const saved = fromStorage();

	const language = ref<Language>(saved.language ?? "en");
	const darkMode = ref<boolean>(saved.darkMode ?? false);
	const accentColor = ref<AccentColor>(saved.accentColor ?? "blue");
	const kanjiFont = ref<KanjiFont>(saved.kanjiFont ?? "os");
	const uiFont = ref<UIFont>(saved.uiFont ?? "be-vietnam-pro");

	function reset() {
		language.value = "vi";
		darkMode.value = false;
		accentColor.value = "blue";
		kanjiFont.value = "os";
		uiFont.value = "be-vietnam-pro";
	}

	// Sync i18n locale with persisted language
	(i18n.global.locale as unknown as { value: string }).value = language.value;
	watch(language, (val) => {
		(i18n.global.locale as unknown as { value: string }).value = val;
	});

	// Apply dark class on init (inline script in index.html handles first paint to avoid FOUC)
	document.documentElement.classList.toggle("dark", darkMode.value);

	watch(darkMode, (val) => {
		const html = document.documentElement;
		html.classList.add("dark-transitioning");
		html.classList.toggle("dark", val);
		setTimeout(() => html.classList.remove("dark-transitioning"), 300);
	});

	watchEffect(() => {
		const preset = ACCENT_PRESETS[accentColor.value];
		const root = document.documentElement.style;
		const isDark = darkMode.value;
		root.setProperty("--primary", isDark ? preset.dark : preset.light);
		root.setProperty(
			"--primary-foreground",
			isDark ? "oklch(0.1 0 0)" : "oklch(0.985 0 0)",
		);
		root.setProperty("--ring", preset.ring);
	});

	watchEffect(() => {
		loadFont(kanjiFont.value);
		const family =
			KANJI_FONT_OPTIONS.find((f) => f.value === kanjiFont.value)?.family ??
			"system-ui";
		document.documentElement.style.setProperty("--font-kanji", family);
	});

	watchEffect(() => {
		loadFont(uiFont.value);
		const family =
			UI_FONT_OPTIONS.find((f) => f.value === uiFont.value)?.family ??
			"system-ui";
		document.documentElement.style.setProperty("--font-ui", family);
		document.body.style.fontFamily = family;
	});

	watch([language, darkMode, accentColor, kanjiFont, uiFont], () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				language: language.value,
				darkMode: darkMode.value,
				accentColor: accentColor.value,
				kanjiFont: kanjiFont.value,
				uiFont: uiFont.value,
			}),
		);
	});

	return { language, darkMode, accentColor, kanjiFont, uiFont, reset };
});
