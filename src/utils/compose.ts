import type { Handler, Middleware } from "@/types";

export const compose = (
	handler: Handler,
	middlewares: Middleware[],
): Handler => {
	return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
};
