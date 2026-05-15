const BASE_URL = import.meta.env.VITE_API_URL as string;

interface ApiEnvelope<T> {
	err: number;
	message: string;
	data: T;
}

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
	for (const fn of refreshQueue) fn(token);
	refreshQueue = [];
}

function signOut() {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
	drainQueue("");
	window.dispatchEvent(new CustomEvent("auth:expired"));
}

async function tryRefresh(): Promise<string | null> {
	const refreshToken = localStorage.getItem("refreshToken");
	if (!refreshToken) return null;

	if (isRefreshing) {
		return new Promise((resolve) => {
			refreshQueue.push(resolve);
		});
	}

	isRefreshing = true;
	try {
		const res = await fetch(`${BASE_URL}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!res.ok) {
			signOut();
			return null;
		}

		const body = (await res.json()) as ApiEnvelope<{
			accessToken: string;
			refreshToken: string;
		}>;
		const { accessToken, refreshToken: newRefresh } = body.data;
		localStorage.setItem("accessToken", accessToken);
		localStorage.setItem("refreshToken", newRefresh);
		drainQueue(accessToken);
		return accessToken;
	} catch {
		signOut();
		return null;
	} finally {
		isRefreshing = false;
	}
}

export async function apiFetch<T>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const token = localStorage.getItem("accessToken");

	const makeHeaders = (t: string | null) => ({
		"Content-Type": "application/json",
		...(t ? { Authorization: `Bearer ${t}` } : {}),
		...init.headers,
	});

	let res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: makeHeaders(token),
	});

	if (res.status === 401) {
		const newToken = await tryRefresh();
		if (!newToken) {
			const envelope = (await res.json().catch(() => ({}))) as {
				message?: string;
			};
			throw new HttpError(401, envelope.message ?? "Unauthorized");
		}
		res = await fetch(`${BASE_URL}${path}`, {
			...init,
			headers: makeHeaders(newToken),
		});
	}

	const body = (await res.json()) as ApiEnvelope<T>;

	if (!res.ok) {
		throw new HttpError(res.status, body.message ?? "Something went wrong");
	}

	return body.data;
}

export async function apiFetchForm<T>(
	path: string,
	formData: FormData,
): Promise<T> {
	const token = localStorage.getItem("accessToken");

	const makeReq = (t: string | null) =>
		fetch(`${BASE_URL}${path}`, {
			method: "POST",
			headers: t ? { Authorization: `Bearer ${t}` } : {},
			body: formData,
		});

	let res = await makeReq(token);

	if (res.status === 401) {
		const newToken = await tryRefresh();
		if (!newToken) throw new HttpError(401, "Unauthorized");
		res = await makeReq(newToken);
	}

	const body = (await res.json()) as ApiEnvelope<T>;
	if (!res.ok)
		throw new HttpError(res.status, body.message ?? "Something went wrong");
	return body.data;
}
