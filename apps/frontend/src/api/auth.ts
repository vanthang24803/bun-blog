import { apiFetch } from "@/lib/api";

export interface LoginBody {
	email: string;
	password: string;
}

export interface RegisterBody {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface Profile {
	publicId: string;
	email: string;
	firstName: string;
	lastName: string;
	bio: string | null;
	avatar: string | null;
	phone: string | null;
	createdAt: string;
	updatedAt: string;
}

export function login(body: LoginBody) {
	return apiFetch<AuthTokens>("/auth/login", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function register(body: RegisterBody) {
	return apiFetch<Profile>("/auth/register", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function logout() {
	return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

export function refresh(refreshToken: string) {
	return apiFetch<AuthTokens>("/auth/refresh", {
		method: "POST",
		body: JSON.stringify({ refreshToken }),
	});
}

export function getMe() {
	return apiFetch<Profile>("/me/profile");
}
