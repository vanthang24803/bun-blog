import { z } from "zod";

export const registerSchema = z.object({
	firstName: z.string().min(1, "firstName is required"),
	lastName: z.string().min(1, "lastName is required"),
	email: z.email("invalid email address"),
	password: z.string().min(6, "password must be at least 6 characters"),
});

export const loginSchema = z.object({
	email: z.email("invalid email address"),
	password: z.string().min(1, "password is required"),
});

export const refreshSchema = z.object({
	refreshToken: z.string().min(1, "refreshToken is required"),
});

export const changePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, "oldPassword is required"),
		newPassword: z.string().min(6, "newPassword must be at least 6 characters"),
		confirmNewPassword: z.string().min(1, "confirmNewPassword is required"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "confirmNewPassword does not match newPassword",
		path: ["confirmNewPassword"],
	})
	.refine((data) => data.oldPassword !== data.newPassword, {
		message: "newPassword must be different from oldPassword",
		path: ["newPassword"],
	});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
