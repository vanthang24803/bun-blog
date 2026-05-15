import type { Handler } from "@app/shared/types";
import { verifyToken } from "@/lib/jwt";
import { errRes } from "@/utils/response";

export const requestUser = new WeakMap<
	Request,
	{ userId: string; email: string }
>();

const authMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		const authHeader = req.headers.get("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return errRes(401, "Unauthorized");
		}

		const token = authHeader.slice(7);

		let payload: Record<string, unknown>;
		try {
			payload = await verifyToken(token);
		} catch {
			return errRes(401, "Unauthorized");
		}

		if (payload.type !== "access" || !payload.sub) {
			return errRes(401, "Unauthorized");
		}

		requestUser.set(req, {
			userId: String(payload.sub),
			email: String(payload.email ?? ""),
		});

		return handler(req);
	};

export default authMiddleware;
