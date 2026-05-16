import { describe, expect, test } from "bun:test";
import corsMiddleware from "@/middlewares/cors.middleware";

describe("corsMiddleware", () => {
	test("includes PATCH in preflight allow methods", async () => {
		const handler = corsMiddleware(async () => Response.json({ ok: true }));
		const res = await handler(
			new Request("http://localhost/api/v1/me/posts/post-public-id", {
				method: "OPTIONS",
			}),
		);

		expect(res.status).toBe(204);
		expect(res.headers.get("Access-Control-Allow-Methods")).toContain("PATCH");
	});
});
