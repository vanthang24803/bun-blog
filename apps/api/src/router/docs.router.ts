import type { Handler } from "@app/shared/types";
import config from "@/config";

const version = String(config.version ?? "1");
const baseUrl = `http://${config.hostname === "0.0.0.0" ? "localhost" : config.hostname}:${config.port}`;
const apiBase = `/api/v${version}`;

function jsonContent(schema: object) {
	return {
		"application/json": {
			schema,
		},
	};
}

function success(schema: object) {
	return {
		type: "object",
		properties: {
			err: { type: "integer", example: 200 },
			message: { type: "string", example: "Success" },
			data: schema,
			metadata: { $ref: "#/components/schemas/Metadata" },
		},
		required: ["err", "message", "data", "metadata"],
	};
}

function errorResponse(status: number, description: string, example: string) {
	return {
		description,
		content: jsonContent({
			allOf: [
				{ $ref: "#/components/schemas/ErrorResponse" },
				{
					type: "object",
					properties: {
						err: { type: "integer", example: status },
						message: { type: "string", example },
					},
				},
			],
		}),
	};
}

function pathParam(
	name: string,
	description: string,
	schema: Record<string, unknown> = { type: "string" },
) {
	return {
		name,
		in: "path",
		required: true,
		description,
		schema,
	};
}

function queryParam(
	name: string,
	description: string,
	schema: Record<string, unknown>,
) {
	return {
		name,
		in: "query",
		required: false,
		description,
		schema,
	};
}

const docsSpec = {
	openapi: "3.1.0",
	info: {
		title: "Bun Supabase API",
		version: `v${version}`,
		description:
			"HTTP API for authentication, profile management, blog content, comments, reactions, and bookmarks.",
	},
	servers: [
		{
			url: baseUrl,
			description: config.env === "development" ? "Development" : "Runtime",
		},
	],
	tags: [
		{ name: "Auth", description: "Authentication and token rotation." },
		{ name: "Users", description: "Authenticated profile operations." },
		{ name: "Categories", description: "Blog category listing and creation." },
		{ name: "Tags", description: "Blog tag listing and creation." },
		{
			name: "Posts",
			description:
				"Post listing, creation, update, deletion, and cover upload.",
		},
		{
			name: "Comments",
			description: "Comment and reply operations for posts.",
		},
		{ name: "Reactions", description: "Reactions on posts and comments." },
		{
			name: "Bookmarks",
			description: "Bookmark operations for the current user.",
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			Metadata: {
				type: "object",
				properties: {
					requestAt: { type: "string", format: "date-time" },
					path: { type: "string", example: `${apiBase}/posts` },
				},
				required: ["requestAt", "path"],
			},
			ErrorResponse: {
				type: "object",
				properties: {
					err: { type: "integer", example: 400 },
					message: { type: "string", example: "Bad request" },
					metadata: { $ref: "#/components/schemas/Metadata" },
				},
				required: ["err", "message", "metadata"],
			},
			TokenPair: {
				type: "object",
				properties: {
					accessToken: { type: "string" },
					refreshToken: { type: "string" },
				},
				required: ["accessToken", "refreshToken"],
			},
			Profile: {
				type: "object",
				properties: {
					id: { type: "integer", example: 12 },
					publicId: { type: "string", format: "uuid" },
					email: { type: "string", format: "email" },
					firstName: { type: "string" },
					lastName: { type: "string" },
					bio: { type: ["string", "null"] },
					avatar: { type: ["string", "null"], format: "uri" },
					phone: { type: ["string", "null"] },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
				required: [
					"id",
					"publicId",
					"email",
					"firstName",
					"lastName",
					"createdAt",
					"updatedAt",
				],
			},
			Category: {
				type: "object",
				properties: {
					id: { type: "integer" },
					publicId: { type: "string", format: "uuid" },
					name: { type: "string" },
					slug: { type: "string" },
					icon: { type: ["string", "null"] },
					description: { type: ["string", "null"] },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
				required: ["id", "publicId", "name", "slug", "createdAt", "updatedAt"],
			},
			Tag: {
				type: "object",
				properties: {
					id: { type: "integer" },
					publicId: { type: "string", format: "uuid" },
					name: { type: "string" },
					slug: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
				},
				required: ["id", "publicId", "name", "slug", "createdAt"],
			},
			Post: {
				type: "object",
				properties: {
					id: { type: "integer" },
					publicId: { type: "string", format: "uuid" },
					authorId: { type: "integer" },
					categoryId: { type: ["integer", "null"] },
					title: { type: "string" },
					slug: { type: "string" },
					content: { type: "string" },
					excerpt: { type: ["string", "null"] },
					coverImage: { type: ["string", "null"], format: "uri" },
					status: {
						type: "string",
						enum: ["draft", "published", "archived"],
					},
					publishedAt: { type: ["string", "null"], format: "date-time" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
				required: [
					"id",
					"publicId",
					"authorId",
					"title",
					"slug",
					"content",
					"status",
					"createdAt",
					"updatedAt",
				],
			},
			PostDetail: {
				allOf: [
					{ $ref: "#/components/schemas/Post" },
					{
						type: "object",
						properties: {
							tags: {
								type: "array",
								items: { $ref: "#/components/schemas/Tag" },
							},
							reactionCount: { type: "integer", example: 5 },
						},
						required: ["tags", "reactionCount"],
					},
				],
			},
			Comment: {
				type: "object",
				properties: {
					id: { type: "integer" },
					publicId: { type: "string", format: "uuid" },
					postId: { type: "integer" },
					authorId: { type: "integer" },
					parentId: { type: ["integer", "null"] },
					content: { type: "string" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
					authorFirstName: { type: ["string", "null"] },
					authorLastName: { type: ["string", "null"] },
					authorAvatar: { type: ["string", "null"], format: "uri" },
					authorEmail: { type: ["string", "null"], format: "email" },
				},
				required: [
					"id",
					"publicId",
					"postId",
					"authorId",
					"content",
					"createdAt",
					"updatedAt",
				],
			},
			PostReaction: {
				type: "object",
				properties: {
					id: { type: "integer" },
					postId: { type: "integer" },
					profileId: { type: "integer" },
					type: {
						type: "string",
						enum: ["like", "love", "insightful"],
					},
					createdAt: { type: "string", format: "date-time" },
				},
				required: ["id", "postId", "profileId", "type", "createdAt"],
			},
			CommentReaction: {
				type: "object",
				properties: {
					id: { type: "integer" },
					commentId: { type: "integer" },
					profileId: { type: "integer" },
					type: {
						type: "string",
						enum: ["like", "love", "insightful"],
					},
					createdAt: { type: "string", format: "date-time" },
				},
				required: ["id", "commentId", "profileId", "type", "createdAt"],
			},
			Bookmark: {
				type: "object",
				properties: {
					id: { type: "integer" },
					postId: { type: "integer" },
					profileId: { type: "integer" },
					createdAt: { type: "string", format: "date-time" },
				},
				required: ["id", "postId", "profileId", "createdAt"],
			},
			UploadResult: {
				type: "object",
				properties: {
					url: { type: "string", format: "uri" },
				},
				required: ["url"],
			},
		},
	},
	paths: {
		[`${apiBase}/auth/register`]: {
			post: {
				tags: ["Auth"],
				summary: "Register a new user account.",
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["firstName", "lastName", "email", "password"],
						properties: {
							firstName: { type: "string", minLength: 1 },
							lastName: { type: "string", minLength: 1 },
							email: { type: "string", format: "email" },
							password: { type: "string", minLength: 6 },
						},
					}),
				},
				responses: {
					"201": {
						description: "Profile created.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Profile" }),
						),
					},
					"409": errorResponse(
						409,
						"Email already exists.",
						"Email already in use",
					),
				},
			},
		},
		[`${apiBase}/auth/login`]: {
			post: {
				tags: ["Auth"],
				summary: "Login and receive access and refresh tokens.",
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["email", "password"],
						properties: {
							email: { type: "string", format: "email" },
							password: { type: "string", minLength: 1 },
						},
					}),
				},
				responses: {
					"200": {
						description: "Authenticated.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/TokenPair" }),
						),
					},
					"401": errorResponse(
						401,
						"Invalid credentials.",
						"Invalid credentials",
					),
				},
			},
		},
		[`${apiBase}/auth/logout`]: {
			post: {
				tags: ["Auth"],
				summary:
					"Logout and revoke server-side refresh tokens for the current profile.",
				security: [{ bearerAuth: [] }],
				responses: {
					"200": {
						description: "Logout completed.",
						content: jsonContent(
							success({
								type: "object",
								properties: {
									message: { type: "string", example: "Logged out" },
								},
								required: ["message"],
							}),
						),
					},
					"401": errorResponse(
						401,
						"Missing or invalid bearer token.",
						"Unauthorized",
					),
				},
			},
		},
		[`${apiBase}/auth/refresh`]: {
			post: {
				tags: ["Auth"],
				summary: "Rotate a refresh token and issue a new token pair.",
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["refreshToken"],
						properties: {
							refreshToken: { type: "string", minLength: 1 },
						},
					}),
				},
				responses: {
					"200": {
						description: "Token pair rotated.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/TokenPair" }),
						),
					},
					"401": errorResponse(
						401,
						"Refresh token is invalid, expired, or revoked.",
						"Invalid or expired refresh token",
					),
				},
			},
		},
		[`${apiBase}/auth/change-password`]: {
			post: {
				tags: ["Auth"],
				summary: "Change the current authenticated user's password.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["oldPassword", "newPassword", "confirmNewPassword"],
						properties: {
							oldPassword: { type: "string", minLength: 1 },
							newPassword: { type: "string", minLength: 6 },
							confirmNewPassword: { type: "string", minLength: 1 },
						},
					}),
				},
				responses: {
					"200": {
						description: "Password updated and refresh sessions revoked.",
						content: jsonContent(
							success({
								type: "object",
								properties: {
									message: {
										type: "string",
										example: "Password changed successfully",
									},
								},
								required: ["message"],
							}),
						),
					},
					"400": errorResponse(
						400,
						"Payload validation failed.",
						"confirmNewPassword: confirmNewPassword does not match newPassword",
					),
					"401": errorResponse(
						401,
						"Authentication failed or old password is incorrect.",
						"Old password is incorrect",
					),
					"404": errorResponse(
						404,
						"Account does not exist.",
						"Account not found",
					),
				},
			},
		},
		[`${apiBase}/me/profile`]: {
			get: {
				tags: ["Users"],
				summary: "Get the current authenticated profile.",
				security: [{ bearerAuth: [] }],
				responses: {
					"200": {
						description: "Current profile.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Profile" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Profile does not exist.",
						"Profile not found",
					),
				},
			},
		},
		[`${apiBase}/me/profile/update`]: {
			post: {
				tags: ["Users"],
				summary: "Update mutable profile fields.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						properties: {
							firstName: { type: "string", minLength: 1 },
							lastName: { type: "string", minLength: 1 },
							bio: { type: "string" },
							avatar: { type: "string", format: "uri" },
							phone: { type: "string" },
						},
						minProperties: 1,
					}),
				},
				responses: {
					"200": {
						description: "Updated profile row.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Profile" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Profile does not exist.",
						"Profile not found",
					),
				},
			},
		},
		[`${apiBase}/me/avatar`]: {
			post: {
				tags: ["Users"],
				summary: "Upload a new avatar.",
				description:
					"Requires multipart/form-data with an `avatar` field containing a WEBP file up to 5 MB.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["avatar"],
								properties: {
									avatar: { type: "string", format: "binary" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Profile row after avatar update.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Profile" }),
						),
					},
					"400": errorResponse(
						400,
						"Invalid upload payload.",
						"avatar must be webp",
					),
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Profile does not exist.",
						"Profile not found",
					),
				},
			},
		},
		[`${apiBase}/categories`]: {
			get: {
				tags: ["Categories"],
				summary: "List all categories.",
				responses: {
					"200": {
						description: "Category list.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Category" },
							}),
						),
					},
				},
			},
			post: {
				tags: ["Categories"],
				summary: "Create a new category.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["name", "slug"],
						properties: {
							name: { type: "string", minLength: 1, maxLength: 100 },
							slug: {
								type: "string",
								pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
							},
							description: { type: "string" },
						},
					}),
				},
				responses: {
					"201": {
						description: "Category created.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Category" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"409": errorResponse(
						409,
						"Category slug already exists.",
						"Category slug already exists",
					),
				},
			},
		},
		[`${apiBase}/tags`]: {
			get: {
				tags: ["Tags"],
				summary: "List all tags.",
				responses: {
					"200": {
						description: "Tag list.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Tag" },
							}),
						),
					},
				},
			},
			post: {
				tags: ["Tags"],
				summary: "Create a new tag.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["name", "slug"],
						properties: {
							name: { type: "string", minLength: 1, maxLength: 50 },
							slug: {
								type: "string",
								pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
							},
						},
					}),
				},
				responses: {
					"201": {
						description: "Tag created.",
						content: jsonContent(success({ $ref: "#/components/schemas/Tag" })),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"409": errorResponse(
						409,
						"Tag slug already exists.",
						"Tag slug already exists",
					),
				},
			},
		},
		[`${apiBase}/posts`]: {
			get: {
				tags: ["Posts"],
				summary: "List posts.",
				description:
					"Returns published posts by default. Set `mine=1` to list the current user's posts; that branch requires a bearer token.",
				parameters: [
					queryParam(
						"limit",
						"Maximum rows returned. Defaults to 20 and is capped at 100.",
						{
							type: "integer",
							minimum: 1,
							maximum: 100,
						},
					),
					queryParam(
						"offset",
						"1-based starting offset. Values below 1 behave like 1.",
						{
							type: "integer",
							minimum: 1,
						},
					),
					queryParam("categoryId", "Filter by category numeric id.", {
						type: "integer",
						minimum: 1,
					}),
					queryParam("tagId", "Filter posts that have the given tag id.", {
						type: "integer",
						minimum: 1,
					}),
					queryParam(
						"mine",
						"Use `1` to list the authenticated author's own posts.",
						{
							type: "string",
							enum: ["1"],
						},
					),
				],
				responses: {
					"200": {
						description: "Post list.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Post" },
							}),
						),
					},
					"401": errorResponse(401, "Required when `mine=1`.", "Unauthorized"),
				},
			},
			post: {
				tags: ["Posts"],
				summary: "Create a new post.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["title", "slug", "content"],
						properties: {
							title: { type: "string", minLength: 1, maxLength: 255 },
							slug: {
								type: "string",
								pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
							},
							content: { type: "string", minLength: 1 },
							excerpt: { type: "string" },
							coverImage: { type: "string", format: "uri" },
							categoryId: { type: "integer", minimum: 1 },
							tagIds: {
								type: "array",
								items: { type: "integer", minimum: 1 },
							},
							status: {
								type: "string",
								enum: ["draft", "published", "archived"],
								default: "draft",
							},
						},
					}),
				},
				responses: {
					"201": {
						description: "Post created.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Post" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"409": errorResponse(
						409,
						"Post slug already exists.",
						"Post slug already exists",
					),
				},
			},
		},
		[`${apiBase}/posts/upload-cover`]: {
			post: {
				tags: ["Posts"],
				summary: "Upload a cover image for a post.",
				description:
					"Requires multipart/form-data with a `cover` field. Accepted MIME types: jpeg, png, webp, gif. Max size: 5 MB.",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["cover"],
								properties: {
									cover: { type: "string", format: "binary" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Upload URL returned.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/UploadResult" }),
						),
					},
					"400": errorResponse(
						400,
						"Invalid upload payload.",
						"cover must be jpeg, png, webp or gif",
					),
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
				},
			},
		},
		[`${apiBase}/posts/{slug}`]: {
			get: {
				tags: ["Posts"],
				summary: "Get a single post by slug.",
				parameters: [pathParam("slug", "Post slug.")],
				responses: {
					"200": {
						description: "Post detail including tags and reaction count.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/PostDetail" }),
						),
					},
					"404": errorResponse(
						404,
						"Post does not exist or is not visible to the current user.",
						"Post not found",
					),
				},
			},
		},
		[`${apiBase}/me/posts/{publicId}`]: {
			patch: {
				tags: ["Posts"],
				summary: "Update a post owned by the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("publicId", "Post public UUID.", {
						type: "string",
						format: "uuid",
					}),
				],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						properties: {
							title: { type: "string", minLength: 1, maxLength: 255 },
							slug: {
								type: "string",
								pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
							},
							content: { type: "string", minLength: 1 },
							excerpt: { type: "string" },
							coverImage: { type: "string", format: "uri" },
							categoryId: { type: "integer", minimum: 1 },
							tagIds: {
								type: "array",
								items: { type: "integer", minimum: 1 },
							},
							status: {
								type: "string",
								enum: ["draft", "published", "archived"],
							},
						},
						minProperties: 1,
					}),
				},
				responses: {
					"200": {
						description: "Updated post row.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Post" }),
						),
					},
					"400": errorResponse(
						400,
						"Path parameter is missing or invalid.",
						"Invalid post public id",
					),
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"403": errorResponse(
						403,
						"Post belongs to another author.",
						"Forbidden",
					),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
			delete: {
				tags: ["Posts"],
				summary: "Delete a post owned by the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("publicId", "Post public UUID.", {
						type: "string",
						format: "uuid",
					}),
				],
				responses: {
					"204": { description: "Post deleted." },
					"400": errorResponse(
						400,
						"Path parameter is missing or invalid.",
						"Invalid post public id",
					),
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"403": errorResponse(
						403,
						"Post belongs to another author.",
						"Forbidden",
					),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
		},
		[`${apiBase}/posts/{slug}/comments`]: {
			get: {
				tags: ["Comments"],
				summary: "List top-level comments for a post.",
				parameters: [pathParam("slug", "Post slug.")],
				responses: {
					"200": {
						description: "Top-level comments.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Comment" },
							}),
						),
					},
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
			post: {
				tags: ["Comments"],
				summary: "Create a new comment or reply on a post.",
				security: [{ bearerAuth: [] }],
				parameters: [pathParam("slug", "Post slug.")],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["content"],
						properties: {
							content: { type: "string", minLength: 1, maxLength: 5000 },
							parentId: { type: "integer", minimum: 1 },
						},
					}),
				},
				responses: {
					"201": {
						description: "Comment created.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Comment" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Post or parent comment does not exist.",
						"Parent comment not found",
					),
				},
			},
		},
		[`${apiBase}/comments/{id}`]: {
			post: {
				tags: ["Comments"],
				summary: "Update an existing comment owned by the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("id", "Comment numeric id.", {
						type: "integer",
						minimum: 1,
					}),
				],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						required: ["content"],
						properties: {
							content: { type: "string", minLength: 1, maxLength: 5000 },
						},
					}),
				},
				responses: {
					"200": {
						description: "Updated comment.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Comment" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"403": errorResponse(
						403,
						"Comment belongs to another author.",
						"Forbidden",
					),
					"404": errorResponse(
						404,
						"Comment does not exist.",
						"Comment not found",
					),
				},
			},
			delete: {
				tags: ["Comments"],
				summary: "Delete an existing comment owned by the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("id", "Comment numeric id.", {
						type: "integer",
						minimum: 1,
					}),
				],
				responses: {
					"204": { description: "Comment deleted." },
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"403": errorResponse(
						403,
						"Comment belongs to another author.",
						"Forbidden",
					),
					"404": errorResponse(
						404,
						"Comment does not exist.",
						"Comment not found",
					),
				},
			},
		},
		[`${apiBase}/comments/{id}/replies`]: {
			get: {
				tags: ["Comments"],
				summary: "List direct replies for a comment.",
				parameters: [
					pathParam("id", "Comment numeric id.", {
						type: "integer",
						minimum: 1,
					}),
				],
				responses: {
					"200": {
						description: "Replies for the comment.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Comment" },
							}),
						),
					},
					"404": errorResponse(
						404,
						"Comment does not exist.",
						"Comment not found",
					),
				},
			},
		},
		[`${apiBase}/posts/{slug}/reactions`]: {
			post: {
				tags: ["Reactions"],
				summary: "Create or update the current user's reaction on a post.",
				security: [{ bearerAuth: [] }],
				parameters: [pathParam("slug", "Post slug.")],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						properties: {
							type: {
								type: "string",
								enum: ["like", "love", "insightful"],
								default: "like",
							},
						},
					}),
				},
				responses: {
					"200": {
						description: "Reaction created or updated.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/PostReaction" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
			delete: {
				tags: ["Reactions"],
				summary: "Remove the current user's reaction from a post.",
				security: [{ bearerAuth: [] }],
				parameters: [pathParam("slug", "Post slug.")],
				responses: {
					"204": { description: "Reaction removed." },
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
		},
		[`${apiBase}/comments/{id}/reactions`]: {
			post: {
				tags: ["Reactions"],
				summary: "Create or update the current user's reaction on a comment.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("id", "Comment numeric id.", {
						type: "integer",
						minimum: 1,
					}),
				],
				requestBody: {
					required: true,
					content: jsonContent({
						type: "object",
						properties: {
							type: {
								type: "string",
								enum: ["like", "love", "insightful"],
								default: "like",
							},
						},
					}),
				},
				responses: {
					"200": {
						description: "Reaction created or updated.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/CommentReaction" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Comment does not exist.",
						"Comment not found",
					),
				},
			},
			delete: {
				tags: ["Reactions"],
				summary: "Remove the current user's reaction from a comment.",
				security: [{ bearerAuth: [] }],
				parameters: [
					pathParam("id", "Comment numeric id.", {
						type: "integer",
						minimum: 1,
					}),
				],
				responses: {
					"204": { description: "Reaction removed." },
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(
						404,
						"Comment does not exist.",
						"Comment not found",
					),
				},
			},
		},
		[`${apiBase}/posts/{slug}/bookmarks`]: {
			post: {
				tags: ["Bookmarks"],
				summary: "Bookmark a post for the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [pathParam("slug", "Post slug.")],
				responses: {
					"201": {
						description: "Bookmark created.",
						content: jsonContent(
							success({ $ref: "#/components/schemas/Bookmark" }),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
					"409": errorResponse(
						409,
						"Post already bookmarked.",
						"Already bookmarked",
					),
				},
			},
			delete: {
				tags: ["Bookmarks"],
				summary: "Remove a bookmark for the current user.",
				security: [{ bearerAuth: [] }],
				parameters: [pathParam("slug", "Post slug.")],
				responses: {
					"204": { description: "Bookmark removed." },
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
					"404": errorResponse(404, "Post does not exist.", "Post not found"),
				},
			},
		},
		[`${apiBase}/me/bookmarks`]: {
			get: {
				tags: ["Bookmarks"],
				summary: "List bookmarked posts for the current user.",
				security: [{ bearerAuth: [] }],
				responses: {
					"200": {
						description: "Bookmarked posts.",
						content: jsonContent(
							success({
								type: "array",
								items: { $ref: "#/components/schemas/Post" },
							}),
						),
					},
					"401": errorResponse(401, "Authentication required.", "Unauthorized"),
				},
			},
		},
	},
} as const;

const scalarPage: Handler = async () =>
	new Response(
		`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${docsSpec.info.title}</title>
  </head>
  <body>
    <script id="api-reference" data-url="/docs/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`,
		{ headers: { "Content-Type": "text/html" } },
	);

const openapiJson: Handler = async () => Response.json(docsSpec);

export const docsRouter = {
	"/docs": { GET: scalarPage },
	"/docs/openapi.json": { GET: openapiJson },
};
