import { describe, expect, test } from "bun:test";
import { Result } from "@conecta/result";
import { noopNotifier } from "../../noop-notifier.adapter";

describe("NoopNotifier Adapter", () => {
	test("notify deve retornar Result.ok(undefined)", async () => {
		const result = await noopNotifier.notify({
			channel: "email",
			recipient: "user@example.com",
			subject: "Teste",
			body: "Mensagem de teste",
			metadata: { correlationId: "corr-123" },
		});

		expect(Result.isOk(result)).toBe(true);
		expect(Result.unwrap(result)).toBeUndefined();
	});
});
