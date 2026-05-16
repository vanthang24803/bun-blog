import { S3Client } from "bun";
import config from "@/config";

export const s3 = new S3Client({
	endpoint: config.s3.endpoint,
	accessKeyId: config.s3.accessKeyId,
	secretAccessKey: config.s3.secretAccessKey,
	bucket: config.s3.bucket,
});

export function generateAvatarKey(): string {
	return `avatars/${Bun.randomUUIDv7()}.webp`;
}
