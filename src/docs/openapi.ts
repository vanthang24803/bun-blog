import config from "@/config";

const version = config.version ?? "1";

function envelope(dataSchema: object) {
	return {
		type: "object",
		properties: {
			err: { type: "integer", example: 200 },
			message: { type: "string", example: "Success" },
			data: dataSchema,
			metadata: { $ref: "#/components/schemas/Metadata" },
		},
		required: ["err", "message", "data", "metadata"],
	};
}
const base = `/api/v${version}`;

const bearerAuth = {
	security: [{ bearerAuth: [] }],
};

export const openapi = {
	openapi: "3.1.0",
	info: {
		title: "Bun App API",
		version: `v${version}`,
		description: "REST API built with Bun, Drizzle ORM, and PostgreSQL.",
	},
	servers: [
		{
			url: `http://${config.hostname === "0.0.0.0" ? "localhost" : config.hostname}:${config.port}`,
			description: config.env === "development" ? "Development" : "Production",
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
					path: { type: "string", example: "/api/v1/auth/login" },
				},
				required: ["requestAt", "path"],
			},
			ErrorResponse: {
				type: "object",
				properties: {
					err: { type: "integer", example: 400 },
					message: { type: "string", example: "something went wrong" },
					metadata: { $ref: "#/components/schemas/Metadata" },
				},
				required: ["err", "message", "metadata"],
			},
			User: {
				type: "object",
				properties: {
					id: { type: "string", format: "uuid" },
					email: { type: "string", format: "email" },
					firstName: { type: "string" },
					lastName: { type: "string" },
					bio: { type: "string", nullable: true },
					avatar: { type: "string", format: "uri", nullable: true },
					phone: { type: "string", nullable: true },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Tokens: {
				type: "object",
				properties: {
					accessToken: { type: "string" },
					refreshToken: { type: "string" },
				},
				required: ["accessToken", "refreshToken"],
			},
		},
	},
	tags: [
		{ name: "Auth", description: "Authentication endpoints" },
		{ name: "Users", description: "User management endpoints (requires auth)" },
	],
	paths: {
		[`${base}/auth/register`]: {
			post: {
				tags: ["Auth"],
				summary: "Register a new user",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["firstName", "lastName", "email", "password"],
								properties: {
									firstName: { type: "string", example: "John" },
									lastName: { type: "string", example: "Doe" },
									email: {
										type: "string",
										format: "email",
										example: "john@example.com",
									},
									password: {
										type: "string",
										minLength: 6,
										example: "secret123",
									},
								},
							},
						},
					},
				},
				responses: {
					"201": {
						description: "User created",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/User" }),
							},
						},
					},
					"400": {
						description: "Missing required fields",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"409": {
						description: "Email already in use",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/auth/login`]: {
			post: {
				tags: ["Auth"],
				summary: "Login and receive tokens",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["email", "password"],
								properties: {
									email: {
										type: "string",
										format: "email",
										example: "john@example.com",
									},
									password: { type: "string", example: "secret123" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Login successful",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/Tokens" }),
							},
						},
					},
					"400": {
						description: "Missing fields",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"401": {
						description: "Invalid credentials",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/auth/refresh`]: {
			post: {
				tags: ["Auth"],
				summary: "Rotate tokens using a refresh token",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								required: ["refreshToken"],
								properties: {
									refreshToken: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "New token pair issued",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/Tokens" }),
							},
						},
					},
					"400": {
						description: "Missing refreshToken",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"401": {
						description: "Invalid or revoked refresh token",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/auth/logout`]: {
			post: {
				tags: ["Auth"],
				summary: "Logout and revoke refresh token",
				...bearerAuth,
				responses: {
					"200": { description: "Logged out successfully" },
					"401": {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/me/profile`]: {
			get: {
				tags: ["Users"],
				summary: "Get the authenticated user's profile",
				...bearerAuth,
				responses: {
					"200": {
						description: "Current user",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/User" }),
							},
						},
					},
					"401": {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"404": {
						description: "User not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/me/profile/update`]: {
			put: {
				tags: ["Users"],
				summary: "Update the authenticated user's profile",
				...bearerAuth,
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								minProperties: 1,
								properties: {
									firstName: { type: "string", minLength: 1, example: "John" },
									lastName: { type: "string", minLength: 1, example: "Doe" },
									bio: { type: "string", example: "Software engineer" },
									avatar: {
										type: "string",
										format: "uri",
										example: "https://example.com/avatar.jpg",
									},
									phone: { type: "string", example: "+1234567890" },
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Profile updated",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/User" }),
							},
						},
					},
					"400": {
						description: "No fields provided",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"401": {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		[`${base}/me/avatar`]: {
			post: {
				tags: ["Users"],
				summary: "Upload avatar image",
				...bearerAuth,
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["avatar"],
								properties: {
									avatar: {
										type: "string",
										format: "binary",
										description: "Image file (jpeg, png, webp, gif — max 5 MB)",
									},
								},
							},
						},
					},
				},
				responses: {
					"200": {
						description: "Avatar uploaded, profile returned",
						content: {
							"application/json": {
								schema: envelope({ $ref: "#/components/schemas/User" }),
							},
						},
					},
					"400": {
						description: "Missing file, invalid type, or file too large",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"401": {
						description: "Unauthorized",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
	},
};
