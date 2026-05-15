import { updateMeSchema } from "@app/shared/schemas/users.schema";
import { getMe, updateMe, uploadAvatar } from "@/handlers/users.handler";
import authMiddleware from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware, authMiddleware];

export const usersRouter = {
	"/me/profile": {
		GET: compose(getMe, mw),
	},
	"/me/profile/update": {
		POST: compose(updateMe, [...mw, validate(updateMeSchema)]),
	},
	"/me/avatar": {
		POST: compose(uploadAvatar, mw),
	},
};
