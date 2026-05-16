import { createI18n } from "vue-i18n";
import en from "./locales/en";
import ja from "./locales/ja";
import vi from "./locales/vi";

type MessageSchema = typeof en;

function getSavedLocale(): string {
	try {
		const s = JSON.parse(localStorage.getItem("ui-settings") ?? "{}");
		if (s.language === "vi" || s.language === "en" || s.language === "ja") return s.language;
	} catch {}
	return "vi";
}

export const i18n = createI18n<[MessageSchema], "vi" | "en" | "ja">({
	legacy: false,
	locale: getSavedLocale(),
	fallbackLocale: "en",
	messages: { vi, en, ja },
});

export default i18n;
