import { describe, expect, it } from "bun:test";
import { spawn } from "bun";

const shouldRunNonUnit = ["1", "true"].includes(
	(Bun.env.RUN_NON_UNIT ?? process.env.RUN_NON_UNIT ?? "").toLowerCase(),
);
const describeNonUnit = shouldRunNonUnit ? describe : describe.skip;

describeNonUnit("Bootstrap Security Validations", () => {
	it("deve rejeitar PORT não numérica", async () => {
		const proc = spawn({
			cmd: ["bun", "run", "src/server.ts"],
			env: { ...process.env, PORT: "invalid" },
			stdout: "pipe",
			stderr: "pipe",
		});

		const exitCode = await proc.exited;
		expect(exitCode).not.toBe(0); // Deve falhar
	});

	it("deve rejeitar PORT fora do range", async () => {
		const proc = spawn({
			cmd: ["bun", "run", "src/server.ts"],
			env: { ...process.env, PORT: "99999" },
			stdout: "pipe",
			stderr: "pipe",
		});

		const exitCode = await proc.exited;
		expect(exitCode).not.toBe(0);
	});

	it("deve rejeitar falta de SC_DB_USER", async () => {
		const { SC_DB_USER, ...envWithout } = process.env;
		const proc = spawn({
			cmd: ["bun", "run", "src/server.ts"],
			env: { ...envWithout, PORT: "3000", SC_DB_PASSWORD: "", SC_DB_NAME: "" },
			stdout: "pipe",
			stderr: "pipe",
		});

		try {
			const result = await Promise.race([
				proc.exited,
				new Promise<number>((_, reject) =>
					setTimeout(() => reject(new Error("Timeout")), 2000),
				),
			]);

			expect(result).not.toBe(0);
		} catch {
			proc.kill();
			throw new Error("Process should exit with error code, not timeout");
		}
	});

	it("deve rejeitar falta de SC_DB_PASSWORD", async () => {
		const { SC_DB_PASSWORD, ...envWithout } = process.env;
		const proc = spawn({
			cmd: ["bun", "run", "src/server.ts"],
			env: { ...envWithout, PORT: "3000", SC_DB_USER: "test" },
			stdout: "pipe",
			stderr: "pipe",
		});

		try {
			const result = await Promise.race([
				proc.exited,
				new Promise<number>((_, reject) =>
					setTimeout(() => reject(new Error("Timeout")), 2000),
				),
			]);

			expect(result).not.toBe(0);
		} catch {
			proc.kill();
			throw new Error("Process should exit with error code, not timeout");
		}
	});

	it("deve rejeitar falta de SC_DB_NAME", async () => {
		const { SC_DB_NAME, ...envWithout } = process.env;
		const proc = spawn({
			cmd: ["bun", "run", "src/server.ts"],
			env: {
				...envWithout,
				PORT: "3000",
				SC_DB_USER: "test",
				SC_DB_PASSWORD: "test",
			},
			stdout: "pipe",
			stderr: "pipe",
		});

		try {
			const result = await Promise.race([
				proc.exited,
				new Promise<number>((_, reject) =>
					setTimeout(() => reject(new Error("Timeout")), 2000),
				),
			]);

			expect(result).not.toBe(0);
		} catch {
			proc.kill();
			throw new Error("Process should exit with error code, not timeout");
		}
	});
});
