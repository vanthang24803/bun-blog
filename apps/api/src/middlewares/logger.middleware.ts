import type { Handler } from "@app/shared/types";
import { logger } from "@/utils/logger";

const loggerMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		const start = performance.now();

		const url = new URL(req.url);

		const response = await handler(req);

		const duration = Math.round(performance.now() - start);

		logger.info({
			method: req.method,
			path: url.pathname,
			status: response.status,
			duration: `${duration}ms`,
		});

		return response;
	};

export default loggerMiddleware;
