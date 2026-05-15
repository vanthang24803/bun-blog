import { ALLOWED_TYPES, MAX_SIZE } from "@app/shared/constants";
import type { UpdateMeInput } from "@app/shared/schemas/users.schema";
import type { Handler } from "@app/shared/types";
import { eq } from "drizzle-orm";
import config from "@/config";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { s3 } from "@/lib/s3";
import { requestUser } from "@/middlewares/auth.middleware";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

function safeProfile(p: typeof profiles.$inferSelect) {
	const { passwordHash: _, ...safe } = p;
	return safe;
}

export const getMe: Handler = async (req) => {
	const db = getDb();
	const user = requestUser.get(req);
	if (!user) return errRes(401, "Unauthorized");
	const { userId } = user;
	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.id, userId));
	if (!profile) return errRes(404, "Profile not found");
	return Response.json(safeProfile(profile));
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

	const ext = ALLOWED_TYPES[file.type];
	if (!ext) return errRes(400, "avatar must be jpeg, png, webp or gif");
	if (file.size > MAX_SIZE)
		return errRes(400, "avatar must be smaller than 5 MB");

	const key = `avatars/${userId}.${ext}`;
	await s3.write(key, await file.arrayBuffer(), { type: file.type });

	const avatarUrl = `${config.supabaseUrl}/storage/v1/object/public/${config.s3.bucket}/${key}`;
	const [profile] = await db
		.update(profiles)
		.set({ avatar: avatarUrl })
		.where(eq(profiles.id, userId))
		.returning();
	if (!profile) return errRes(404, "Profile not found");
	return Response.json(safeProfile(profile));
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
	return Response.json(safeProfile(profile));
};
