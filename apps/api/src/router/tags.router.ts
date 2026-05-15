import { createTagSchema } from "@app/shared/schemas/blog.schema";
import { createTag, listTags } from "@/handlers/tags.handler";
import authMiddleware from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware];
const authedMw = [loggerMiddleware, authMiddleware];

export const tagsRouter = {
	"/tags": {
		GET: compose(listTags, mw),
		POST: compose(createTag, [...authedMw, validate(createTagSchema)]),
	},
};
