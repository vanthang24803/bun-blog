import { createCategorySchema } from "@app/shared/schemas/blog.schema";
import { createCategory, listCategories } from "@/handlers/categories.handler";
import authMiddleware from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware];
const authedMw = [loggerMiddleware, authMiddleware];

export const categoriesRouter = {
	"/categories": {
		GET: compose(listCategories, mw),
		POST: compose(createCategory, [
			...authedMw,
			validate(createCategorySchema),
		]),
	},
};
