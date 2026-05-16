import { onUnmounted, ref } from "vue";

export interface TocHeading {
	id: string;
	text: string;
	level: number;
}

export function useToc() {
	const headings = ref<TocHeading[]>([]);
	const activeId = ref("");
	let observer: IntersectionObserver | null = null;

	function slugify(text: string) {
		return text
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	}

	function setup(el: HTMLElement | null) {
		observer?.disconnect();
		if (!el) return;

		const nodes = Array.from(
			el.querySelectorAll("h1,h2,h3,h4"),
		) as HTMLElement[];

		if (!nodes.length) {
			headings.value = [];
			return;
		}

		const items: TocHeading[] = nodes.map((node, i) => {
			const text = node.textContent?.trim() ?? "";
			const id = node.id || `h-${slugify(text) || i}`;
			node.id = id;
			return { id, text, level: +node.tagName[1] };
		});

		headings.value = items;
		activeId.value = items[0]?.id ?? "";

		observer = new IntersectionObserver(
			(entries) => {
				// Pick the topmost intersecting heading
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length) activeId.value = visible[0].target.id;
			},
			{ rootMargin: "-10% 0px -75% 0px", threshold: 0 },
		);

		nodes.forEach((n) => observer!.observe(n));
	}

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
		activeId.value = id;
	}

	onUnmounted(() => observer?.disconnect());

	return { headings, activeId, setup, scrollTo };
}
