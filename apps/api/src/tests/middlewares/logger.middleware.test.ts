import { describe, expect, mock, test } from "bun:test";

const infoMock = mock(() => {});

mock.module("@/utils/logger", () => ({
	logger: { info: infoMock },
}));

const { default: loggerMiddleware } = await import(
	"@/middlewares/logger.middleware"
);

describe("loggerMiddleware", () => {
	test("passes the request to the inner handler and returns its response", async () => {
		const inner = mock(async (_req: Request) =>
			Response.json({ ok: true }, { status: 201 }),
		);
		const handler = loggerMiddleware(inner);
		const res = await handler(new Request("http://localhost/test"));
		expect(inner).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(201);
	});

	test("calls logger.info with method, path, status, and duration", async () => {
		infoMock.mockClear();
		const inner = mock(async () => new Response(null, { status: 204 }));
		const handler = loggerMiddleware(inner);
		await handler(new Request("http://localhost/hello", { method: "POST" }));

		expect(infoMock).toHaveBeenCalledTimes(1);
		const logged = (infoMock.mock.calls as any)[0][0] as Record<
			string,
			unknown
		>;
		expect(logged.method).toBe("POST");
		expect(logged.path).toBe("/hello");
		expect(logged.status).toBe(204);
		expect(typeof logged.duration).toBe("string");
		expect((logged.duration as string).endsWith("ms")).toBe(true);
	});

	test("returns the original response unchanged", async () => {
		const body = JSON.stringify({ data: 42 });
		const inner = async () =>
			new Response(body, {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		const res = await loggerMiddleware(inner)(new Request("http://localhost/"));
		expect(res.status).toBe(200);
		expect(await res.text()).toBe(body);
	});
});
