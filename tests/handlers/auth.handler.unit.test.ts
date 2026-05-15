import { describe, expect, mock, test } from "bun:test";

const dbMock = {
	select: mock(() => dbMock),
	from: mock(() => dbMock),
	where: mock(() => dbMock),
	insert: mock(() => dbMock),
	values: mock(() => dbMock),
	returning: mock(() => dbMock),
	delete: mock(() => dbMock),
	update: mock(() => dbMock),
	set: mock(() => dbMock),
} as any;

mock.module("@/db", () => ({
	db: dbMock,
}));

mock.module("@/middlewares/validate.middleware", () => ({
	getBody: mock((req) => (req as any)._body),
}));

mock.module("@/lib/jwt", () => ({
	REFRESH_TTL: 3600,
	signAccessToken: mock(() => Promise.resolve("access-token")),
	signRefreshToken: mock(() => Promise.resolve("refresh-token")),
	verifyToken: mock((token: string) => {
		if (token === "valid-refresh")
			return Promise.resolve({ type: "refresh", jti: "jti", sub: "sub" });
		if (token === "valid-access")
			return Promise.resolve({ type: "access", sub: "sub" });
		throw new Error("Invalid token");
	}),
}));

import { login, logout, refresh, register } from "@/handlers/auth.handler";

describe("auth handler unit tests", () => {
	test("register returns 409 if email exists", async () => {
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([{ id: "1" }]);
		const req = new Request("http://localhost/register", { method: "POST" });
		// @ts-expect-error
		req._body = {
			email: "test@example.com",
			password: "password",
			firstName: "A",
			lastName: "B",
		};

		const res = await register(req);
		const body = (await res.json()) as any;
		expect(res.status).toBe(409);
		expect(body.message).toBe("Email already in use");
	});

	test("register returns 201 on success", async () => {
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([]);
		dbMock.insert.mockReturnValueOnce(dbMock);
		dbMock.values.mockReturnValueOnce(dbMock);
		dbMock.returning.mockResolvedValueOnce([
			{
				id: "uuid",
				publicId: "public-uuid",
				email: "test@example.com",
				firstName: "A",
				lastName: "B",
				passwordHash: "hash",
			},
		]);
		const req = new Request("http://localhost/register", { method: "POST" });
		// @ts-expect-error
		req._body = {
			email: "test@example.com",
			password: "password",
			firstName: "A",
			lastName: "B",
		};

		const res = await register(req);
		const body = (await res.json()) as any;
		expect(res.status).toBe(201);
		expect(body.email).toBe("test@example.com");
		expect(body.publicId).toBe("public-uuid");
		expect(body.id).toBeUndefined();
		expect(body.passwordHash).toBeUndefined();
	});

	test("login returns 401 for unknown email", async () => {
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([]);
		const req = new Request("http://localhost/login", { method: "POST" });
		// @ts-expect-error
		req._body = { email: "unknown@example.com", password: "pass" };

		const res = await login(req);
		expect(res.status).toBe(401);
	});

	test("login returns 200 and tokens on success", async () => {
		const passwordHash = await Bun.password.hash("secret");
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([
			{ id: "sub", email: "test@example.com", passwordHash },
		]);
		dbMock.insert.mockReturnValueOnce(dbMock);
		dbMock.values.mockResolvedValueOnce([]);
		const req = new Request("http://localhost/login", { method: "POST" });
		// @ts-expect-error
		req._body = { email: "test@example.com", password: "secret" };

		const res = await login(req);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.accessToken).toBe("access-token");
		expect(body.refreshToken).toBe("refresh-token");
	});

	test("logout returns 200", async () => {
		const req = new Request("http://localhost/logout", {
			method: "POST",
			headers: { Authorization: "Bearer valid-access" },
		});
		dbMock.delete.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([]);

		const res = await logout(req);
		expect(res.status).toBe(200);
	});

	test("refresh returns new tokens", async () => {
		// 1. db.select().from().where() -> check refresh tokens
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([{ id: "jti", profileId: "sub" }]);

		// 2. db.delete().where()
		dbMock.delete.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([]);

		// 3. db.insert().values()
		dbMock.insert.mockReturnValueOnce(dbMock);
		dbMock.values.mockResolvedValueOnce([]);

		// 4. db.select().from().where() -> get profile
		dbMock.select.mockReturnValueOnce(dbMock);
		dbMock.from.mockReturnValueOnce(dbMock);
		dbMock.where.mockResolvedValueOnce([
			{ id: "sub", email: "test@example.com" },
		]);

		const req = new Request("http://localhost/refresh", { method: "POST" });
		// @ts-expect-error
		req._body = { refreshToken: "valid-refresh" };

		const res = await refresh(req);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.accessToken).toBe("access-token");
		expect(body.refreshToken).toBe("refresh-token");
	});
});
