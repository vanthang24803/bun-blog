import { z } from "zod";

export const updateMeSchema = z
	.object({
		firstName: z.string().min(1).optional(),
		lastName: z.string().min(1).optional(),
		bio: z.string().optional(),
		avatar: z.url("avatar must be a valid URL").optional(),
		phone: z.string().optional(),
	})
	.refine((d) => d.firstName ?? d.lastName ?? d.bio ?? d.avatar ?? d.phone, {
		message: "at least one field is required",
	});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
