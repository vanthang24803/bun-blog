import { jwtVerify, SignJWT } from "jose";
import config from "@/config";

const secret = new TextEncoder().encode(config.jwtSecret);

const ACCESS_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export type AccessPayload = {
	sub: string;
	email: string;
	type: "access";
};

export type RefreshPayload = {
	sub: string;
	jti: string;
	type: "refresh";
};

export async function signAccessToken(profileId: string, email: string) {
	return new SignJWT({ email, type: "access" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(profileId)
		.setJti(crypto.randomUUID())
		.setIssuedAt()
		.setExpirationTime(`${ACCESS_TTL}s`)
		.sign(secret);
}

export async function signRefreshToken(profileId: string, jti: string) {
	return new SignJWT({ type: "refresh" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(profileId)
		.setJti(jti)
		.setExpirationTime(`${REFRESH_TTL}s`)
		.sign(secret);
}

export async function verifyToken(token: string) {
	const { payload } = await jwtVerify(token, secret);
	return payload as Record<string, unknown>;
}

export { REFRESH_TTL };
