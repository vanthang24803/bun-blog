import { MAX_SIZE } from "@app/shared/constants";
import type { UpdateMeInput } from "@app/shared/schemas/users.schema";
import type { Handler } from "@app/shared/types";
import { eq } from "drizzle-orm";
import config from "@/config";
import { getDb } from "@/db";
import { profiles, users } from "@/db/schema";
import { generateAvatarKey, s3 } from "@/lib/s3";
import { requestUser } from "@/middlewares/auth.middleware";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

export const getMe: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");

	const [row] = await db
		.select({
			id: profiles.id,
			publicId: profiles.publicId,
			email: users.email,
			firstName: profiles.firstName,
			lastName: profiles.lastName,
			bio: profiles.bio,
			avatar: profiles.avatar,
			phone: profiles.phone,
			createdAt: profiles.createdAt,
			updatedAt: profiles.updatedAt,
		})
		.from(profiles)
		.innerJoin(users, eq(users.id, profiles.userId))
		.where(eq(profiles.id, user.userId));

	if (!row) return errRes(404, "Profile not found");
	return Response.json(row);
};

export const uploadAvatar: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");
	const { userId } = user;

	let formData: globalThis.FormData;
	try {
		formData = (await req.formData()) as globalThis.FormData;
	} catch {
		return errRes(400, "Request must be multipart/form-data");
	}

	const file = formData.get("avatar");
	if (!file || !(file instanceof File))
		return errRes(400, "avatar field is required");

	if (file.type !== "image/webp") return errRes(400, "avatar must be webp");
	if (file.size > MAX_SIZE)
		return errRes(400, "avatar must be smaller than 5 MB");

	const key = generateAvatarKey();
	await s3.write(key, await file.arrayBuffer(), { type: "image/webp" });

	const avatarUrl = `${config.storageBaseUrl}/${key}`;
	const [profile] = await db
		.update(profiles)
		.set({ avatar: avatarUrl })
		.where(eq(profiles.id, userId))
		.returning();
	if (!profile) return errRes(404, "Profile not found");
	return Response.json(profile);
};

export const updateMe: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");
	const { userId } = user;
	const { firstName, lastName, bio, avatar, phone } =
		getBody<UpdateMeInput>(req);

	const patch: Partial<typeof profiles.$inferInsert> = {};
	if (firstName !== undefined) patch.firstName = firstName;
	if (lastName !== undefined) patch.lastName = lastName;
	if (bio !== undefined) patch.bio = bio;
	if (avatar !== undefined) patch.avatar = avatar;
	if (phone !== undefined) patch.phone = phone;

	const [profile] = await db
		.update(profiles)
		.set(patch)
		.where(eq(profiles.id, userId))
		.returning();
	if (!profile) return errRes(404, "Profile not found");
	return Response.json(profile);
};
