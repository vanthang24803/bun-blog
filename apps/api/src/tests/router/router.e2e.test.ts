import { afterAll, describe, expect, test } from "bun:test";
import router from "@/router/router";

const server = Bun.serve({ port: 0, routes: router });
const base = `http://${server.hostname}:${server.port}`;

afterAll(() => server.stop());

describe("GET /", () => {
	test("responds with 200", async () => {
		const res = await fetch(`${base}/`);
		expect(res.status).toBe(200);
	});

	test("responds with JSON content-type", async () => {
		const res = await fetch(`${base}/`);
		expect(res.headers.get("content-type")).toContain("application/json");
	});

	test("body contains message, timestamp, and uuid", async () => {
		const body = (await fetch(`${base}/`).then((r) => r.json())) as Record<
			string,
			unknown
		>;
		expect(typeof body.message).toBe("string");
		expect(typeof body.timestamp).toBe("string");
		expect(typeof body.uuid).toBe("string");
	});

	test("timestamp is a valid ISO date", async () => {
		const { timestamp } = (await fetch(`${base}/`).then((r) => r.json())) as {
			timestamp: string;
		};
		expect(Number.isNaN(Date.parse(timestamp))).toBe(false);
	});

	test("each request gets a unique uuid", async () => {
		const [a, b] = await Promise.all([
			fetch(`${base}/`).then((r) => r.json()) as Promise<{ uuid: string }>,
			fetch(`${base}/`).then((r) => r.json()) as Promise<{ uuid: string }>,
		]);
		expect(a.uuid).not.toBe(b.uuid);
	});
});
