import { describe, expect, test } from "bun:test";
import type { Handler, Middleware } from "@/types";
import { compose } from "@/utils/compose";

const makeHandler =
	(status: number, body: string): Handler =>
	async () =>
		new Response(body, { status });

describe("compose", () => {
	test("returns original handler when no middlewares", async () => {
		const handler = makeHandler(200, "ok");
		const composed = compose(handler, []);
		const req = new Request("http://localhost/");
		const res = await composed(req);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("ok");
	});

	test("applies a single middleware", async () => {
		const handler = makeHandler(200, "original");
		const mw: Middleware = (h) => async (req) => {
			const res = await h(req);
			return new Response("wrapped", { status: res.status });
		};
		const composed = compose(handler, [mw]);
		const res = await composed(new Request("http://localhost/"));
		expect(await res.text()).toBe("wrapped");
	});

	test("applies middlewares outermost-first (right-to-left reduceRight)", async () => {
		const order: string[] = [];
		const makeMiddleware =
			(label: string): Middleware =>
			(h) =>
			async (req) => {
				order.push(label);
				return h(req);
			};

		const handler = makeHandler(200, "body");
		const composed = compose(handler, [
			makeMiddleware("first"),
			makeMiddleware("second"),
		]);

		await composed(new Request("http://localhost/"));
		// reduceRight wraps second around first, so first runs outermost
		expect(order).toEqual(["first", "second"]);
	});

	test("passes the request through each middleware", async () => {
		let captured: Request | null = null;
		const mw: Middleware = (h) => async (req) => {
			captured = req;
			return h(req);
		};
		const req = new Request("http://localhost/test");
		await compose(makeHandler(200, ""), [mw])(req);
		expect(captured as unknown).toBe(req);
	});
});
