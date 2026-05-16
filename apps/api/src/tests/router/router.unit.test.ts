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

	test("docs routes exist and expose the OpenAPI spec", async () => {
		const htmlHandler = (
			router as Record<
				string,
				{
					GET?: (req: Request) => Response | Promise<Response>;
				}
			>
		)["/docs"]?.GET;
		const jsonHandler = (
			router as Record<
				string,
				{
					GET?: (req: Request) => Response | Promise<Response>;
				}
			>
		)["/docs/openapi.json"]?.GET;

		expect(htmlHandler).toBeDefined();
		expect(jsonHandler).toBeDefined();
		if (!htmlHandler || !jsonHandler) {
			throw new Error("Docs handlers are missing");
		}

		const html = await (
			await htmlHandler(new Request("http://localhost/docs"))
		).text();
		expect(html).toContain("/docs/openapi.json");

		const spec = (await (
			await jsonHandler(new Request("http://localhost/docs/openapi.json"))
		).json()) as {
			paths: Record<string, unknown>;
			tags: Array<{ name: string }>;
		};

		expect(spec.paths["/api/v1/posts"]).toBeDefined();
		expect(spec.paths["/api/v1/me/profile"]).toBeDefined();
		expect(spec.paths["/api/v1/auth/login"]).toBeDefined();
		expect(spec.paths["/api/v1/auth/change-password"]).toBeDefined();
		expect(spec.tags.some((tag) => tag.name === "Posts")).toBe(true);
	});
});
