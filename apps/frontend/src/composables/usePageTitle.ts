import { watchEffect } from "vue";
import { useI18n } from "vue-i18n";

export function usePageTitle(titleFn: () => string | null | undefined) {
	const { t } = useI18n();

	watchEffect(() => {
		const appName = t("pageTitle.appName");
		const title = titleFn();
		document.title = title ? `${title} | ${appName}` : appName;
	});
}
