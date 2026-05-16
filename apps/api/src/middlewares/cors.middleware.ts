import type { Handler } from "@app/shared/types";
import config from "@/config";

const { cors } = config;
const allowedMethods = Array.from(
	new Set(
		cors["Access-Control-Allow-Methods"]
			.split(",")
			.map((method) => method.trim().toUpperCase())
			.filter(Boolean)
			.concat("PATCH"),
	),
).join(", ");

const corsHeaders: Record<string, string> = {
	"Access-Control-Allow-Origin": cors["Access-Control-Allow-Origin"],
	"Access-Control-Allow-Methods": allowedMethods,
	"Access-Control-Allow-Headers": cors["Access-Control-Allow-Headers"],
};

const corsMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		if (req.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		const res = await handler(req);
		const headers = new Headers(res.headers);
		for (const [key, value] of Object.entries(corsHeaders)) {
			headers.set(key, value);
		}

		return new Response(res.body, {
			status: res.status,
			statusText: res.statusText,
			headers,
		});
	};

export default corsMiddleware;
