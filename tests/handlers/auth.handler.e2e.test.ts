import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import config from "@/config";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import router from "@/router/router";

// biome-ignore lint/suspicious/noExplicitAny: Bun.serve routes type is complex
const server = Bun.serve({ port: 0, routes: router as any });
const base = `http://${server.hostname}:${server.port}/api/v${config.version ?? 1}`;

afterAll(() => server.stop());

beforeEach(async () => {
	await db.delete(profiles);
});

// ─── helpers ────────────────────────────────────────────────────────────────

type ApiResponse<T = unknown> = {
	err: number;
	message: string;
	data: T;
	metadata: { requestAt: string; path: string };
};

const defaultUser = {
	firstName: "John",
	lastName: "Doe",
	email: "john@example.com",
	password: "secret123",
};

async function doRegister(payload = defaultUser) {
	return fetch(`${base}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

async function doLogin(
	email = defaultUser.email,
	password = defaultUser.password,
) {
	return fetch(`${base}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
}

async function registerAndLogin() {
	await doRegister();
	const res = await doLogin();
	const body = (await res.json()) as ApiResponse<{
		accessToken: string;
		refreshToken: string;
	}>;
	return body.data;
}

// ─── response shape ──────────────────────────────────────────────────────────

describe("response envelope", () => {
	test("success response contains err, message, data, metadata", async () => {
		await doRegister();
		const body = (await doLogin().then((r) => r.json())) as ApiResponse;
		expect(typeof body.err).toBe("number");
		expect(typeof body.message).toBe("string");
		expect(body.data).toBeDefined();
		expect(typeof body.metadata.requestAt).toBe("string");
		expect(typeof body.metadata.path).toBe("string");
	});

	test("error response has no data field", async () => {
		const body = (await doLogin("x@x.com", "wrong").then((r) =>
			r.json(),
		)) as ApiResponse;
		expect(body.data).toBeUndefined();
	});
});

// ─── register ───────────────────────────────────────────────────────────────

describe("POST /auth/register", () => {
	test("returns 400 when body is missing fields", async () => {
		const res = await fetch(`${base}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "a@b.com" }),
		});
		expect(res.status).toBe(400);
	});

	test("returns 201 and user data on success", async () => {
		const res = await doRegister();
		expect(res.status).toBe(201);

		const { data } = (await res.json()) as ApiResponse<Record<string, unknown>>;
		expect(data.publicId).toBeDefined();
		expect(data.id).toBeUndefined();
		expect(data.email).toBe(defaultUser.email);
		expect(data.firstName).toBe(defaultUser.firstName);
		expect(data.lastName).toBe(defaultUser.lastName);
	});

	test("does not return password in response", async () => {
		const { data } = (await doRegister().then((r) => r.json())) as ApiResponse<
			Record<string, unknown>
		>;
		expect(data.password).toBeUndefined();
	});

	test("returns 409 when email is already in use", async () => {
		await doRegister();
		const res = await doRegister();
		expect(res.status).toBe(409);
	});
});

// ─── login ──────────────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
	test("returns 400 when body is missing fields", async () => {
		const res = await fetch(`${base}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "a@b.com" }),
		});
		expect(res.status).toBe(400);
	});

	test("returns 401 for unknown email", async () => {
		const res = await doLogin("unknown@example.com", "pass");
		expect(res.status).toBe(401);
	});

	test("returns 401 for wrong password", async () => {
		await doRegister();
		const res = await doLogin(defaultUser.email, "wrongpassword");
		expect(res.status).toBe(401);
	});

	test("returns 200 with accessToken and refreshToken on success", async () => {
		await doRegister();
		const res = await doLogin();
		expect(res.status).toBe(200);

		const { data } = (await res.json()) as ApiResponse<Record<string, unknown>>;
		expect(typeof data.accessToken).toBe("string");
		expect(typeof data.refreshToken).toBe("string");
	});
});

// ─── refresh ─────────────────────────────────────────────────────────────────

describe("POST /auth/refresh", () => {
	test("returns 400 when refreshToken is missing", async () => {
		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(400);
	});

	test("returns 401 for an invalid token", async () => {
		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: "not.a.valid.token" }),
		});
		expect(res.status).toBe(401);
	});

	test("returns 401 when using an access token instead of a refresh token", async () => {
		const { accessToken } = await registerAndLogin();
		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: accessToken }),
		});
		expect(res.status).toBe(401);
	});

	test("returns 200 with new accessToken and refreshToken", async () => {
		const { refreshToken } = await registerAndLogin();
		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});
		expect(res.status).toBe(200);

		const { data } = (await res.json()) as ApiResponse<Record<string, unknown>>;
		expect(typeof data.accessToken).toBe("string");
		expect(typeof data.refreshToken).toBe("string");
	});

	test("rotates the refresh token — old token is revoked", async () => {
		const { refreshToken: oldToken } = await registerAndLogin();

		await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: oldToken }),
		});

		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: oldToken }),
		});
		expect(res.status).toBe(401);
	});

	test("new tokens are different from the original ones", async () => {
		const { accessToken, refreshToken } = await registerAndLogin();
		const { data } = (await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		}).then((r) => r.json())) as ApiResponse<{
			accessToken: string;
			refreshToken: string;
		}>;

		expect(data.accessToken).not.toBe(accessToken);
		expect(data.refreshToken).not.toBe(refreshToken);
	});
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe("POST /auth/logout", () => {
	test("returns 401 when no Authorization header", async () => {
		const res = await fetch(`${base}/auth/logout`, { method: "POST" });
		expect(res.status).toBe(401);
	});

	test("returns 401 when Authorization header is malformed", async () => {
		const res = await fetch(`${base}/auth/logout`, {
			method: "POST",
			headers: { Authorization: "invalid" },
		});
		expect(res.status).toBe(401);
	});

	test("returns 200 on successful logout", async () => {
		const { accessToken } = await registerAndLogin();

		const res = await fetch(`${base}/auth/logout`, {
			method: "POST",
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		expect(res.status).toBe(200);
	});

	test("refresh token is revoked after logout", async () => {
		const { accessToken, refreshToken } = await registerAndLogin();

		await fetch(`${base}/auth/logout`, {
			method: "POST",
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		const res = await fetch(`${base}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});
		expect(res.status).toBe(401);
	});
});
