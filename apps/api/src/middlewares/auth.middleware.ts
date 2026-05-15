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

// Sets requestUser if a valid Bearer token is present, but never rejects.
// Use on public routes that have optional auth-dependent behaviour (e.g. mine=1).
export const optionalAuthMiddleware =
	(handler: Handler): Handler =>
	async (req) => {
		const authHeader = req.headers.get("Authorization");
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.slice(7);
			try {
				const payload = await verifyToken(token);
				if (payload.type === "access" && payload.sub) {
					requestUser.set(req, {
						userId: String(payload.sub),
						email: String(payload.email ?? ""),
					});
				}
			} catch {
				// invalid / expired token — treat as unauthenticated
			}
		}
		return handler(req);
	};

export default authMiddleware;
