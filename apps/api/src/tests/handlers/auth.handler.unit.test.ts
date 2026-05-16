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
		innerJoin: mock(() => dbMock),
		transaction: mock(async (cb: (tx: unknown) => Promise<void>) => cb(dbMock)),
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
			return Promise.resolve({ type: "refresh", jti: "jti-uuid", sub: "2" });
		if (token === "valid-access")
			return Promise.resolve({ type: "access", sub: "2" });
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
		currentDb.where.mockResolvedValueOnce([{ id: 1 }]);
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
		// 1. check existing user → not found
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		// 2. transaction:
		//    insert users → returning [{ id: 1 }]
		//    insert profiles → returning [profile]
		currentDb.returning.mockResolvedValueOnce([{ id: 1 }]);
		currentDb.returning.mockResolvedValueOnce([
			{
				id: 1,
				userId: 1,
				publicId: "public-uuid",
				firstName: "A",
				lastName: "B",
				bio: null,
				avatar: null,
				phone: null,
				createdAt: new Date(),
				updatedAt: new Date(),
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
		expect(body.userId).toBeUndefined();
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

		// 1. select users
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([
			{ id: 1, email: "test@example.com", passwordHash },
		]);

		// 2. select profiles by userId
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([{ id: 2 }]);

		// 3. insert refresh_token
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
		expect(currentDb.values).toHaveBeenCalledTimes(1);
		expect(currentDb.values.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				jti: expect.any(String),
				profileId: 2,
				expiresAt: expect.any(Date),
			}),
		);
		expect(currentDb.values.mock.calls[0]?.[0]).not.toHaveProperty("id");
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
		// 1. select refresh_tokens by jti
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([{ id: 1, jti: "jti-uuid", profileId: 2 }]);

		// 2. delete old token by jti
		currentDb.delete.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		// 3. insert new refresh_token
		currentDb.insert.mockReturnValueOnce(currentDb);
		currentDb.values.mockResolvedValueOnce([]);

		// 4. select users innerJoin profiles → get email
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.innerJoin.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([{ email: "test@example.com" }]);

		const req = new Request("http://localhost/refresh", { method: "POST" });
		// @ts-expect-error
		req._body = { refreshToken: "valid-refresh" };

		const res = await refresh(req);
		const body = (await res.json()) as any;
		expect(res.status).toBe(200);
		expect(body.accessToken).toBe("access-token");
		expect(body.refreshToken).toBe("refresh-token");
		expect(currentDb.values).toHaveBeenCalledTimes(1);
		expect(currentDb.values.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				jti: expect.any(String),
				profileId: 2,
				expiresAt: expect.any(Date),
			}),
		);
		expect(currentDb.values.mock.calls[0]?.[0]).not.toHaveProperty("id");
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
		// users select
		newDb.select.mockReturnValueOnce(newDb);
		newDb.from.mockReturnValueOnce(newDb);
		newDb.where.mockResolvedValueOnce([
			{ id: 1, email: "test@example.com", passwordHash },
		]);
		// profiles select
		newDb.select.mockReturnValueOnce(newDb);
		newDb.from.mockReturnValueOnce(newDb);
		newDb.where.mockResolvedValueOnce([{ id: 2 }]);
		// insert refresh_token
		newDb.insert.mockReturnValueOnce(newDb);
		newDb.values.mockResolvedValueOnce([]);
		currentDb = newDb;

		const secondRes = await login(req);
		expect(secondRes.status).toBe(200);
		expect(oldDb.select).toHaveBeenCalledTimes(1);
		expect(newDb.select).toHaveBeenCalledTimes(2);
	});
});
