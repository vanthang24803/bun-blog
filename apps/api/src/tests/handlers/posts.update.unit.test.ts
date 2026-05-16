import { beforeEach, describe, expect, mock, test } from "bun:test";
import { requestUser } from "@/middlewares/auth.middleware";

function createDbMock() {
	const dbMock = {
		select: mock(() => dbMock),
		from: mock(() => dbMock),
		where: mock(() => dbMock),
		update: mock(() => dbMock),
		set: mock(() => dbMock),
		returning: mock(() => dbMock),
		delete: mock(() => dbMock),
		insert: mock(() => dbMock),
	} as any;

	return dbMock;
}

let currentDb = createDbMock();

mock.module("@/db", () => ({
	getDb: mock(() => currentDb),
}));

mock.module("@/middlewares/validate.middleware", () => ({
	getBody: mock((req) => (req as any)._body),
}));

import { updatePost } from "@/handlers/posts.handler";

describe("posts handler update by publicId", () => {
	beforeEach(() => {
		const nextDb = createDbMock();
		Object.assign(currentDb, nextDb);
	});

	test("returns 404 when post publicId does not exist", async () => {
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		const req = new Request("http://localhost/me/posts/post-public-id", {
			method: "PATCH",
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });
		// @ts-expect-error test helper
		req._body = { title: "New title" };

		const res = await updatePost(req);
		const body = (await res.json()) as { message: string };

		expect(res.status).toBe(404);
		expect(body.message).toBe("Post not found");
	});

	test("updates post by publicId for the owner", async () => {
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([
			{ id: 123, publicId: "post-public-id", authorId: 12, publishedAt: null },
		]);

		currentDb.update.mockReturnValueOnce(currentDb);
		currentDb.set.mockReturnValueOnce(currentDb);
		currentDb.where.mockReturnValueOnce(currentDb);
		currentDb.returning.mockResolvedValueOnce([
			{ id: 123, title: "Updated title" },
		]);

		const req = new Request("http://localhost/me/posts/post-public-id", {
			method: "PATCH",
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });
		// @ts-expect-error test helper
		req._body = { title: "Updated title" };

		const res = await updatePost(req);
		const body = (await res.json()) as { title: string };

		expect(res.status).toBe(200);
		expect(body.title).toBe("Updated title");
		expect(currentDb.update).toHaveBeenCalledTimes(1);
	});
});
