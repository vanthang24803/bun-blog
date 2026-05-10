import type { Handler } from "@/types";

const responseMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		const requestAt = new Date().toISOString();
		const path = new URL(req.url).pathname;

		const raw = await handler(req);

		// pass through non-JSON responses (e.g. HTML docs page, 204 preflight)
		if (!raw.headers.get("content-type")?.includes("application/json")) {
			return raw;
		}

		const body = (await raw.json()) as Record<string, unknown>;
		const status = raw.status;
		const metadata = { requestAt, path };

		if (status >= 400) {
			return Response.json(
				{ err: status, message: String(body?.message ?? "Error"), metadata },
				{ status },
			);
		}

		return Response.json(
			{ err: status, message: "Success", data: body, metadata },
			{ status },
		);
	};

export default responseMiddleware;
