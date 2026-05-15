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

export async function apiFetch<T>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const token = localStorage.getItem("accessToken");

	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init.headers,
		},
	});

	const body = (await res.json()) as ApiEnvelope<T>;

	if (!res.ok) {
		throw new HttpError(res.status, body.message ?? "Something went wrong");
	}

	return body.data;
}
