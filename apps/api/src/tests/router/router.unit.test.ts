import { describe, expect, test } from "bun:test";
import router from "@/router/router";

describe("router unit tests", () => {
	test("GET / exists", async () => {
		const req = new Request("http://localhost/");
		const handler = (
			router as Record<
				string,
				{
					GET?: (req: Request) => Response | Promise<Response>;
				}
			>
		)["/"]?.GET;
		expect(handler).toBeDefined();
		if (!handler) {
			throw new Error("Root GET handler is missing");
		}

		const res = await handler(req);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { message: string };
		expect(body.message).toContain("Bun");
	});

	test("API routes are prefixed", () => {
		// apiPrefix is /api/v1 (or whatever config.version is)
		const paths = Object.keys(router);
		expect(paths.some((p) => p.startsWith("/api/v"))).toBe(true);
	});
});
