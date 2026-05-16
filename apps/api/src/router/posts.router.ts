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
	uploadPostCover,
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
	"/posts/upload-cover": {
		POST: compose(uploadPostCover, authedMw),
	},
	"/posts/:slug": {
		GET: compose(getPost, optionalAuthedMw),
		DELETE: compose(deletePost, authedMw),
	},
	"/me/posts/:publicId": {
		PATCH: compose(updatePost, [...authedMw, validate(updatePostSchema)]),
	},

	// comments
	"/posts/:slug/comments": {
		GET: compose(listComments, mw),
		POST: compose(createComment, [...authedMw, validate(createCommentSchema)]),
	},
	"/comments/:id": {
		POST: compose(updateComment, [...authedMw, validate(updateCommentSchema)]),
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
