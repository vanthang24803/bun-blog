import { beforeEach, describe, expect, mock, test } from "bun:test";
import { requestUser } from "@/middlewares/auth.middleware";

const s3Write = mock(() => Promise.resolve(undefined));

mock.module("@/config", () => ({
	default: {
		storageBaseUrl: "https://cdn.example.com",
		s3: {
			bucket: "media-bucket",
		},
	},
}));

mock.module("@/lib/s3", () => ({
	s3: {
		write: s3Write,
	},
}));

mock.module("@/db", () => ({
	getDb: mock(() => ({})),
}));

import { uploadPostCover } from "@/handlers/posts.handler";

describe("posts handler cover upload", () => {
	beforeEach(() => {
		s3Write.mockClear();
	});

	test("returns 400 when cover field is missing", async () => {
		const formData = new FormData();
		const req = new Request("http://localhost/posts/cover", {
			method: "POST",
			body: formData,
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });

		const res = await uploadPostCover(req);
		const body = (await res.json()) as { message: string };

		expect(res.status).toBe(400);
		expect(body.message).toBe("cover field is required");
	});

	test("uploads image to s3 and returns public url", async () => {
		const formData = new FormData();
		formData.append("cover", new File(["img"], "cover.png", { type: "image/png" }));

		const req = new Request("http://localhost/posts/cover", {
			method: "POST",
			body: formData,
		});
		requestUser.set(req, { userId: 12, email: "john@example.com" });

		const res = await uploadPostCover(req);
		const body = (await res.json()) as { url: string };

		expect(res.status).toBe(200);
		expect(body.url).toMatch(
			/^https:\/\/cdn\.example\.com\/media-bucket\/covers\/12\/.+\.png$/,
		);
		expect(s3Write).toHaveBeenCalledTimes(1);
	});
});
