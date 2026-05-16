import { beforeEach, describe, expect, mock, test } from "bun:test";
import { requestUser } from "@/middlewares/auth.middleware";

function createDbMock() {
	const dbMock = {
		select: mock(() => dbMock),
		from: mock(() => dbMock),
		where: mock(() => dbMock),
		delete: mock(() => dbMock),
	} as any;

	return dbMock;
}

const currentDb = createDbMock();

mock.module("@/db", () => ({
	getDb: mock(() => currentDb),
}));

import { deletePost } from "@/handlers/posts.handler";

describe("posts handler delete by publicId", () => {
	beforeEach(() => {
		const nextDb = createDbMock();
		Object.assign(currentDb, nextDb);
	});

	test("returns 404 when post publicId does not exist", async () => {
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		const req = new Request("http://localhost/me/posts/post-public-id", {
			method: "DELETE",
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });

		const res = await deletePost(req);
		const body = (await res.json()) as { message: string };

		expect(res.status).toBe(404);
		expect(body.message).toBe("Post not found");
	});

	test("deletes post by publicId for the owner", async () => {
		currentDb.select.mockReturnValueOnce(currentDb);
		currentDb.from.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([
			{ id: 123, publicId: "post-public-id", authorId: 12 },
		]);

		currentDb.delete.mockReturnValueOnce(currentDb);
		currentDb.where.mockResolvedValueOnce([]);

		const req = new Request("http://localhost/me/posts/post-public-id", {
			method: "DELETE",
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });

		const res = await deletePost(req);

		expect(res.status).toBe(204);
		expect(currentDb.delete).toHaveBeenCalledTimes(1);
	});
});
