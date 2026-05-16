import type { Handler } from "@app/shared/types";
import { isConnectionError, resetDb } from "@/db";
import { logger } from "@/utils/logger";

let inflightReset: Promise<void> | null = null;

async function resetDbOnce() {
	if (!inflightReset) {
		inflightReset = (async () => {
			try {
				await resetDb();
			} finally {
				inflightReset = null;
			}
		})();
	}

	await inflightReset;
}

const responseMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		const requestAt = new Date().toISOString();
		const path = new URL(req.url).pathname;

		let raw: Response;
		try {
			raw = await handler(req);
		} catch (e) {
			if (isConnectionError(e)) {
				try {
					await resetDbOnce();
					raw = await handler(req); // retry once with a fresh connection
				} catch (retryErr) {
					logger.error({ err: retryErr }, "DB retry failed after resetDb");
					return Response.json(
						{
							err: 503,
							message: "Service temporarily unavailable",
							metadata: { requestAt, path },
						},
						{ status: 503 },
					);
				}
			} else {
				// statement timeout, constraint violation, or any other unhandled error
				logger.error({ err: e, path }, "Unhandled handler error");
				return Response.json(
					{
						err: 500,
						message: "Internal server error",
						metadata: { requestAt, path },
					},
					{ status: 500 },
				);
			}
		}

		// pass through non-JSON responses (e.g. HTML docs page, 204 preflight)
		if (!raw.headers.get("content-type")?.includes("application/json")) {
			return raw;
		}

		let body: Record<string, unknown>;
		try {
			body = (await raw.json()) as Record<string, unknown>;
		} catch (e) {
			logger.error(
				{ err: e, path },
				"Failed to parse handler response as JSON",
			);
			return Response.json(
				{
					err: 500,
					message: "Internal server error",
					metadata: { requestAt, path },
				},
				{ status: 500 },
			);
		}

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
