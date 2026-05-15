import { beforeEach, describe, expect, mock, test } from "bun:test";

function createDbMock() {
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

	return dbMock;
}

let currentDb = createDbMock();

mock.module("@/db", () => ({
	db: currentDb,
	getDb: mock(() => currentDb),
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
	beforeEach(() => {
		const nextDb = createDbMock();
		Object.assign(currentDb, nextDb);
	});

	test("register returns 409 if email exists", async () => {
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([{ id: "1" }]);
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
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);
		currentDb.insert.mockReturnValueOnce(currentDb);
		currentDb.values.mockReturnValueOnce(currentDb);
		currentDb.returning.mockResolvedValueOnce([
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
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);
		const req = new Request("http://localhost/login", { method: "POST" });
		// @ts-expect-error
		req._body = { email: "unknown@example.com", password: "pass" };

		const res = await login(req);
		expect(res.status).toBe(401);
	});

	test("login returns 200 and tokens on success", async () => {
		const passwordHash = await Bun.password.hash("secret");
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([
			{ id: "sub", email: "test@example.com", passwordHash },
		]);
		currentDb.insert.mockReturnValueOnce(currentDb);
		currentDb.values.mockResolvedValueOnce([]);
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
		currentDb.delete.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		const res = await logout(req);
		expect(res.status).toBe(200);
	});

	test("refresh returns new tokens", async () => {
		// 1. db.select().from().where() -> check refresh tokens
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([{ id: "jti", profileId: "sub" }]);

		// 2. db.delete().where()
		currentDb.delete.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		// 3. db.insert().values()
		currentDb.insert.mockReturnValueOnce(currentDb);
		currentDb.values.mockResolvedValueOnce([]);

		// 4. db.select().from().where() -> get profile
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([
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

	test("login uses the latest db instance on each invocation", async () => {
		const passwordHash = await Bun.password.hash("secret");
		const oldDb = currentDb;
		oldDb.select.mockReturnValueOnce(oldDb);
		oldDb.from.mockReturnValueOnce(oldDb);
		oldDb.where.mockResolvedValueOnce([]);

		const req = new Request("http://localhost/login", { method: "POST" });
		// @ts-expect-error
		req._body = { email: "test@example.com", password: "secret" };

		const firstRes = await login(req);
		expect(firstRes.status).toBe(401);

		const newDb = createDbMock();
		newDb.select.mockReturnValueOnce(newDb);
		newDb.from.mockReturnValueOnce(newDb);
		newDb.where.mockResolvedValueOnce([
			{ id: "sub", email: "test@example.com", passwordHash },
		]);
		newDb.insert.mockReturnValueOnce(newDb);
		newDb.values.mockResolvedValueOnce([]);
		currentDb = newDb;

		const secondRes = await login(req);
		expect(secondRes.status).toBe(200);
		expect(oldDb.select).toHaveBeenCalledTimes(1);
		expect(newDb.select).toHaveBeenCalledTimes(1);
	});
});
