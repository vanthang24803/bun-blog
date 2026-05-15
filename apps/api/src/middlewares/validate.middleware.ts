import type { Handler } from "@app/shared/types";
import type * as zod from "zod";
import { errRes } from "@/utils/response";

const validatedBody = new WeakMap<Request, unknown>();

export function validate<T>(schema: zod.ZodSchema<T>) {
	return (handler: Handler): Handler =>
		async (req) => {
			// Body already parsed (e.g. on retry after a connection error)
			if (validatedBody.has(req)) return handler(req);

			let raw: unknown;
			try {
				raw = await req.json();
			} catch {
				return errRes(400, "Invalid JSON body");
			}

			const result = schema.safeParse(raw);
			if (!result.success) {
				const message = result.error.issues
					.map((i) =>
						i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message,
					)
					.join("; ");
				return errRes(400, message);
			}

			validatedBody.set(req, result.data);
			return handler(req);
		};
}

export function getBody<T>(req: Request): T {
	return validatedBody.get(req) as T;
}
