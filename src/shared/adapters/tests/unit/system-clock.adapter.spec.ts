import { describe, expect, test } from "bun:test";
import { systemClock } from "../../system-clock.adapter";

describe("SystemClock Adapter", () => {
	test("now deve retornar instância válida de Date", () => {
		const now = systemClock.now();

		expect(now instanceof Date).toBe(true);
		expect(Number.isNaN(now.getTime())).toBe(false);
	});

	test("nowIsoString deve retornar string ISO parseável", () => {
		const iso = systemClock.nowIsoString();
		const parsed = new Date(iso);

		expect(typeof iso).toBe("string");
		expect(iso).toContain("T");
		expect(Number.isNaN(parsed.getTime())).toBe(false);
	});
});
