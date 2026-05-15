import { apiFetch } from "@/lib/api";
import type { CreateTagInput, Tag } from "./blog.types";

export function listTags() {
	return apiFetch<Tag[]>("/tags");
}

export function createTag(body: CreateTagInput) {
	return apiFetch<Tag>("/tags", {
		method: "POST",
		body: JSON.stringify(body),
	});
}
