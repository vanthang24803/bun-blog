import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, refreshTokens } from "@/db/schema";
import {
	REFRESH_TTL,
	signAccessToken,
	signRefreshToken,
	verifyToken,
} from "@/lib/jwt";
import { getBody } from "@/middlewares/validate.middleware";
import type {
	LoginInput,
	RefreshInput,
	RegisterInput,
} from "@/schemas/auth.schema";
import type { Handler } from "@/types";
import { errRes } from "@/utils/response";

export const register: Handler = async (req) => {
	const { firstName, lastName, email, password } = getBody<RegisterInput>(req);

	const [existing] = await db
		.select({ id: profiles.id })
		.from(profiles)
		.where(eq(profiles.email, email));
	if (existing) return errRes(409, "Email already in use");

	const passwordHash = await Bun.password.hash(password);
	const [profile] = await db
		.insert(profiles)
		.values({ email, passwordHash, firstName, lastName })
		.returning();

	if (!profile) return errRes(500, "Failed to create profile");
	const { passwordHash: _, ...safe } = profile;
	return Response.json(safe, { status: 201 });
};

export const login: Handler = async (req) => {
	const { email, password } = getBody<LoginInput>(req);

	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.email, email));
	if (!profile) return errRes(401, "Invalid credentials");

	const valid = await Bun.password.verify(password, profile.passwordHash);
	if (!valid) return errRes(401, "Invalid credentials");

	const jti = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);
	await db
		.insert(refreshTokens)
		.values({ id: jti, profileId: profile.id, expiresAt });

	const accessToken = await signAccessToken(profile.id, profile.email);
	const refreshToken = await signRefreshToken(profile.id, jti);
	return Response.json({ accessToken, refreshToken });
};

export const logout: Handler = async (req) => {
	const token = req.headers.get("Authorization")?.slice(7);
	if (!token) return Response.json({ message: "Logged out" });
	try {
		const payload = await verifyToken(token);
		if (payload.type === "access" && payload.sub) {
			await db
				.delete(refreshTokens)
				.where(eq(refreshTokens.profileId, String(payload.sub)));
		}
	} catch {
		// token already invalid, nothing to revoke
	}
	return Response.json({ message: "Logged out" });
};

export const refresh: Handler = async (req) => {
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
	const profileId = String(payload.sub);

	const [stored] = await db
		.select()
		.from(refreshTokens)
		.where(eq(refreshTokens.id, jti));
	if (!stored) return errRes(401, "Invalid or expired refresh token");

	// rotate: delete old, issue new
	await db.delete(refreshTokens).where(eq(refreshTokens.id, jti));

	const newJti = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000);
	await db.insert(refreshTokens).values({ id: newJti, profileId, expiresAt });

	const [profile] = await db
		.select()
		.from(profiles)
		.where(eq(profiles.id, profileId));
	const newAccess = await signAccessToken(profileId, profile?.email ?? "");
	const newRefresh = await signRefreshToken(profileId, newJti);

	return Response.json({ accessToken: newAccess, refreshToken: newRefresh });
};
