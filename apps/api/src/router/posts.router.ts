import {
	createCommentSchema,
	createPostSchema,
	createReactionSchema,
	updateCommentSchema,
	updatePostSchema,
} from "@app/shared/schemas/blog.schema";
import { addBookmark, removeBookmark } from "@/handlers/bookmarks.handler";
import {
	createComment,
	deleteComment,
	listComments,
	listReplies,
	updateComment,
} from "@/handlers/comments.handler";
import {
	createPost,
	deletePost,
	getPost,
	listMyBookmarks,
	listPosts,
	updatePost,
} from "@/handlers/posts.handler";
import {
	reactToComment,
	reactToPost,
	removeCommentReaction,
	removePostReaction,
} from "@/handlers/reactions.handler";
import authMiddleware, { optionalAuthMiddleware } from "@/middlewares/auth.middleware";
import loggerMiddleware from "@/middlewares/logger.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { compose } from "@/utils/compose";

const mw = [loggerMiddleware];
const optionalAuthedMw = [loggerMiddleware, optionalAuthMiddleware];
const authedMw = [loggerMiddleware, authMiddleware];

export const postsRouter = {
	// posts CRUD
	"/posts": {
		GET: compose(listPosts, optionalAuthedMw),
		POST: compose(createPost, [...authedMw, validate(createPostSchema)]),
	},
	"/posts/:slug": {
		GET: compose(getPost, optionalAuthedMw),
		PATCH: compose(updatePost, [...authedMw, validate(updatePostSchema)]),
		DELETE: compose(deletePost, authedMw),
	},

	// comments
	"/posts/:slug/comments": {
		GET: compose(listComments, mw),
		POST: compose(createComment, [...authedMw, validate(createCommentSchema)]),
	},
	"/comments/:id": {
		PATCH: compose(updateComment, [...authedMw, validate(updateCommentSchema)]),
		DELETE: compose(deleteComment, authedMw),
	},
	"/comments/:id/replies": {
		GET: compose(listReplies, mw),
	},

	// post reactions
	"/posts/:slug/reactions": {
		POST: compose(reactToPost, [...authedMw, validate(createReactionSchema)]),
		DELETE: compose(removePostReaction, authedMw),
	},

	// comment reactions
	"/comments/:id/reactions": {
		POST: compose(reactToComment, [
			...authedMw,
			validate(createReactionSchema),
		]),
		DELETE: compose(removeCommentReaction, authedMw),
	},

	// bookmarks
	"/posts/:slug/bookmarks": {
		POST: compose(addBookmark, authedMw),
		DELETE: compose(removeBookmark, authedMw),
	},
	"/me/bookmarks": {
		GET: compose(listMyBookmarks, authedMw),
	},
};
