import { describe, expect, test } from "bun:test";
import { isConnectionError } from "@/db";

describe("isConnectionError", () => {
	test("matches direct postgres connection-closed errors", () => {
		const err = Object.assign(new Error("Connection closed"), {
			name: "PostgresError",
			code: "ERR_POSTGRES_CONNECTION_CLOSED",
		});

		expect(isConnectionError(err)).toBe(true);
	});

	test("matches wrapped connection-closed errors", () => {
		const cause = Object.assign(new Error("Connection closed"), {
			name: "PostgresError",
		});
		const err = new Error("Failed query");
		(err as Error & { cause?: unknown }).cause = cause;

		expect(isConnectionError(err)).toBe(true);
	});

	test("ignores unrelated errors", () => {
		expect(isConnectionError(new Error("boom"))).toBe(false);
	});
});
