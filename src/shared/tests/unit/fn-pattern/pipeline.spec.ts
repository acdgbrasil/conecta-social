import { describe, expect, test } from "bun:test";
import { Result } from "@conecta/result";
import { runPipeline } from "@conecta/fn";

describe("UseCasePipeline (Generators)", () => {
  test("deve executar um fluxo de sucesso linearmente", async () => {
    const result = await runPipeline(async function* () {
      const a = yield Result.ok(10);
      const b = yield Result.ok(20);
      return Result.ok(a + b);
    });

    expect(Result.isOk(result)).toBe(true);
    expect(Result.unwrap(result)).toBe(30);
  });

  test("deve interromper a execução no primeiro erro (short-circuit)", async () => {
    let secondStepCalled = false;

    const result = await runPipeline(async function* () {
      yield Result.err("erro fatal");
      secondStepCalled = true; // Não deve chegar aqui
      return Result.ok("sucesso?");
    });

    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("erro fatal");
    expect(secondStepCalled).toBe(false);
  });

  test("deve lidar com passos assíncronos reais (I/O simulado)", async () => {
    const result = await runPipeline(async function* () {
      const val = yield new Promise((resolve) => {
        setTimeout(() => resolve(Result.ok(50)), 5);
      });
      return Result.ok(val * 2);
    });

    expect(Result.isOk(result)).toBe(true);
    expect(Result.unwrap(result)).toBe(100);
  });

  test("deve aguardar Promise assíncrona real antes de inspecionar Result", async () => {
    let stepAfterIoCalled = false;

    const result = await runPipeline(async function* () {
      yield new Promise((resolve) => {
        setTimeout(() => resolve(Result.err("io-error")), 5);
      });

      stepAfterIoCalled = true;
      return Result.ok("nao-deveria-chegar-aqui");
    });

    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("io-error");
    expect(stepAfterIoCalled).toBe(false);
  });

  test("deve permitir misturar valores puros e Results", async () => {
    const result = await runPipeline(async function* () {
      const a = yield 10; // Valor puro
      const b = yield Result.ok(20);
      return Result.ok(a + b);
    });

    expect(Result.unwrap(result)).toBe(30);
  });

  test("deve propagar exceções não tratadas do pipeline", async () => {
    const expectedError = new Error("boom");

    const run = runPipeline(async function* () {
      yield Promise.reject(expectedError);
      return Result.ok("nunca");
    });

    await expect(run).rejects.toThrow("boom");
  });
});
