import { describe, expect, test } from "bun:test";
import router from "@/router/router";

describe("router unit tests", () => {
	test("GET / exists", async () => {
		const req = new Request("http://localhost/");
		// @ts-expect-error
		const handler = router["/"]?.GET;
		expect(handler).toBeDefined();

		const res = await (handler as any)(req);
		expect(res.status).toBe(200);
		const body = (await res.json()) as any;
		expect(body.message).toContain("Bun");
	});

	test("API routes are prefixed", () => {
		// apiPrefix is /api/v1 (or whatever config.version is)
		const paths = Object.keys(router);
		expect(paths.some((p) => p.startsWith("/api/v"))).toBe(true);
	});
});
