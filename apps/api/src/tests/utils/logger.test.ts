import { describe, expect, test } from "bun:test";
import { formatGmt7Timestamp } from "@/utils/logger";

describe("formatGmt7Timestamp", () => {
	test("converts UTC date to GMT+7 timestamp", () => {
		const timestamp = formatGmt7Timestamp(new Date("2026-05-15T00:30:45.123Z"));

		expect(timestamp).toBe("2026-05-15T07:30:45.123+07:00");
	});
});
