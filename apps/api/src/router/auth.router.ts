import {
	changePasswordSchema,
	loginSchema,
	refreshSchema,
	registerSchema,
} from "@app/shared/schemas/auth.schema";
import {
	changePassword,
	login,
	logout,
	refresh,
	register,
} from "@/handlers/auth.handler";
import authMiddleware from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware];
const authedMw = [loggerMiddleware, authMiddleware];

export const authRouter = {
	"/auth/register": {
		POST: compose(register, [...mw, validate(registerSchema)]),
	},
	"/auth/login": { POST: compose(login, [...mw, validate(loginSchema)]) },
	"/auth/logout": { POST: compose(logout, authedMw) },
	"/auth/refresh": { POST: compose(refresh, [...mw, validate(refreshSchema)]) },
	"/auth/change-password": {
		POST: compose(changePassword, [
			...authedMw,
			validate(changePasswordSchema),
		]),
	},
};
