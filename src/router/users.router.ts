import { getMe, updateMe, uploadAvatar } from "@/handlers/users.handler";
import authMiddleware from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { updateMeSchema } from "@/schemas/users.schema";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware, authMiddleware];

export const usersRouter = {
	"/me/profile": {
		GET: compose(getMe, mw),
	},
	"/me/profile/update": {
		PUT: compose(updateMe, [...mw, validate(updateMeSchema)]),
	},
	"/me/avatar": {
		POST: compose(uploadAvatar, mw),
	},
};
