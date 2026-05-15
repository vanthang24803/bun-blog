import { apiFetch } from "@/lib/api";
import type { Category, CreateCategoryInput } from "./blog.types";

export function listCategories() {
	return apiFetch<Category[]>("/categories");
}

export function createCategory(body: CreateCategoryInput) {
	return apiFetch<Category>("/categories", {
		method: "POST",
		body: JSON.stringify(body),
	});
}
