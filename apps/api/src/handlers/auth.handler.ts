import type {
	LoginInput,
	RefreshInput,
	RegisterInput,
} from "@app/shared/schemas/auth.schema";
import type { Handler } from "@app/shared/types";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, refreshTokens, users } from "@/db/schema";
import {
	REFRESH_TTL,
	signAccessToken,
	signRefreshToken,
	verifyToken,
} from "@/lib/jwt";
import { getBody } from "@/middlewares/validate.middleware";
import { errRes } from "@/utils/response";

export const register: Handler = async (req) => {
	const db = getDb();
	const { firstName, lastName, email, password } = getBody<RegisterInput>(req);

	const [existing] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, email));
	if (existing) return errRes(409, "Email already in use");

	const passwordHash = await Bun.password.hash(password);

	let profile: typeof profiles.$inferSelect | undefined;
	await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(users)
			.values({ email, passwordHash })
			.returning({ id: users.id });
		if (!user) return;
		const [p] = await tx
			.insert(profiles)
			.values({ userId: user.id, firstName, lastName })
			.returning();
		profile = p;
	});

	if (!profile) return errRes(500, "Failed to create profile");
	const { id: _, userId: __, ...safeProfile } = profile;
	return Response.json({ ...safeProfile, email }, { status: 201 });
};

export const login: Handler = async (req) => {
	const db = getDb();
	const { email, password } = getBody<LoginInput>(req);

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email));
	if (!user) return errRes(401, "Invalid credentials");

	const valid = await Bun.password.verify(password, user.passwordHash);
	if (!valid) return errRes(401, "Invalid credentials");

	const [profile] = await db
		.select({ id: profiles.id })
		.from(profiles)
		.where(eq(profiles.userId, user.id));
	if (!profile) return errRes(401, "Invalid credentials");

	const jti = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);
	await db.insert(refreshTokens).values({ jti, profileId: profile.id, expiresAt });

	const accessToken = await signAccessToken(String(profile.id), user.email);
	const refreshToken = await signRefreshToken(String(profile.id), jti);
	return Response.json({ accessToken, refreshToken });
};

export const logout: Handler = async (req) => {
	const db = getDb();
	const token = req.headers.get("Authorization")?.slice(7);
	if (!token) return Response.json({ message: "Logged out" });
	try {
		const payload = await verifyToken(token);
		if (payload.type === "access" && payload.sub) {
			await db
				.delete(refreshTokens)
				.where(eq(refreshTokens.profileId, Number(payload.sub)));
		}
	} catch {
		// token already invalid, nothing to revoke
	}
	return Response.json({ message: "Logged out" });
};

export const refresh: Handler = async (req) => {
	const db = getDb();
	const { refreshToken } = getBody<RefreshInput>(req);

	let payload: Record<string, unknown>;
	try {
		payload = await verifyToken(refreshToken);
	} catch {
		return errRes(401, "Invalid or expired refresh token");
	}

	if (payload.type !== "refresh" || !payload.jti || !payload.sub) {
		return errRes(401, "Invalid or expired refresh token");
	}

	const jti = String(payload.jti);

	const [stored] = await db
		.select()
		.from(refreshTokens)
		.where(eq(refreshTokens.jti, jti));
	if (!stored) return errRes(401, "Invalid or expired refresh token");

	// rotate: delete old, issue new
	await db.delete(refreshTokens).where(eq(refreshTokens.jti, jti));

	const newJti = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);
	await db.insert(refreshTokens).values({ jti: newJti, profileId: stored.profileId, expiresAt });

	const [userRow] = await db
		.select({ email: users.email })
		.from(users)
		.innerJoin(profiles, eq(profiles.userId, users.id))
		.where(eq(profiles.id, stored.profileId));

	const newAccess = await signAccessToken(String(stored.profileId), userRow?.email ?? "");
	const newRefresh = await signRefreshToken(String(stored.profileId), newJti);

	return Response.json({ accessToken: newAccess, refreshToken: newRefresh });
};
