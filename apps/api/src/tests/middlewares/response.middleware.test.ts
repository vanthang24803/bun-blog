import { describe, expect, mock, test } from "bun:test";

const resetDbMock = mock(
	() => new Promise<void>((resolve) => setTimeout(resolve, 25)),
);
const errorMock = mock(() => {});

mock.module("@/db", () => ({
	isConnectionError: (e: unknown) =>
		(e as { cause?: { code?: string } })?.cause?.code ===
		"ERR_POSTGRES_CONNECTION_CLOSED",
	resetDb: resetDbMock,
}));

mock.module("@/utils/logger", () => ({
	logger: { error: errorMock },
}));

const { default: responseMiddleware } = await import(
	"@/middlewares/response.middleware"
);

function makeConnectionClosedError() {
	const cause = Object.assign(new Error("Connection closed"), {
		code: "ERR_POSTGRES_CONNECTION_CLOSED",
	});
	const err = new Error("query failed");
	(err as Error & { cause?: unknown }).cause = cause;
	return err;
}

describe("responseMiddleware", () => {
	test("deduplicates concurrent DB resets before retrying requests", async () => {
		resetDbMock.mockClear();
		errorMock.mockClear();

		const attempts = new WeakMap<Request, number>();
		const inner = async (req: Request) => {
			const nextAttempt = (attempts.get(req) ?? 0) + 1;
			attempts.set(req, nextAttempt);

			if (nextAttempt === 1) throw makeConnectionClosedError();
			return Response.json({ ok: true });
		};

		const handler = responseMiddleware(inner);
		const [first, second] = await Promise.all([
			handler(new Request("http://localhost/first")),
			handler(new Request("http://localhost/second")),
		]);

		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
		expect(resetDbMock).toHaveBeenCalledTimes(1);
		expect(errorMock).not.toHaveBeenCalled();
	});
});
