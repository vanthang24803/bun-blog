import { z } from "zod";

export const registerSchema = z.object({
	firstName: z.string().min(1, "firstName is required"),
	lastName: z.string().min(1, "lastName is required"),
	email: z.string().email("invalid email address"),
	password: z.string().min(6, "password must be at least 6 characters"),
});

export const loginSchema = z.object({
	email: z.string().email("invalid email address"),
	password: z.string().min(1, "password is required"),
});

export const refreshSchema = z.object({
	refreshToken: z.string().min(1, "refreshToken is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
