import type { Handler } from "@app/shared/types";
import config from "@/config";
import corsMiddleware from "@/middlewares/cors.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import responseMiddleware from "@/middlewares/response.middleware";
import { compose } from "@/utils/compose";
import { authRouter } from "./auth.router";
import { docsRouter } from "./docs.router";
import { usersRouter } from "./users.router";

type MethodMap = Partial<Record<string, Handler>>;
type RouteMap = Record<string, MethodMap>;

function prefixRoutes(prefix: string, routes: RouteMap): RouteMap {
	return Object.fromEntries(
		Object.entries(routes).map(([path, methods]) => [
			`${prefix}${path}`,
			methods,
		]),
	);
}

const preflightHandler: Handler = async () =>
	new Response(null, { status: 204 });

function wrapRoutes(routes: RouteMap, wrap: (h: Handler) => Handler): RouteMap {
	return Object.fromEntries(
		Object.entries(routes).map(([path, methods]) => [
			path,
			{
				OPTIONS: corsMiddleware(preflightHandler),
				...Object.fromEntries(
					Object.entries(methods).map(([method, handler]) => [
						method,
						handler ? wrap(handler) : wrap(preflightHandler),
					]),
				),
			},
		]),
	);
}

// public routes: CORS only (no response envelope)
const applyCors = (routes: RouteMap) =>
	wrapRoutes(routes, (h) => corsMiddleware(h));

// api routes: CORS + response envelope
const applyApi = (routes: RouteMap) =>
	wrapRoutes(routes, (h) => corsMiddleware(responseMiddleware(h)));

const apiPrefix = `/api/v${config.version ?? 1}`;

const helloWorldHandler: Handler = async (_req) => {
	return Response.json({
		message: "Hi! This is new server written in Bun!",
		timestamp: new Date().toISOString(),
		uuid: Bun.randomUUIDv7(),
	});
};

const router = {
	...applyCors({
		"/": { GET: compose(helloWorldHandler, [loggerMiddleware]) },
		...docsRouter,
	}),
	...applyApi(prefixRoutes(apiPrefix, { ...authRouter, ...usersRouter })),
};

export default router;
