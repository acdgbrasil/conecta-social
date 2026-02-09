import { describe, expect, test, mock } from "bun:test";
import { Result } from "@conecta/result";
import { UseCasePipeline } from "@conecta/fn";

type MockCommand = { id: string; value: number };
type MockContext = { id: number; value: number };
type MockAggregate = { id: number; total: number };

describe("UseCasePipeline (Constructor)", () => {
  const mockRepo = { save: mock(async () => Result.ok(undefined)) };
  const mockBus = { publish: mock(() => {}) };
  const mockPull = mock(() => ({ events: [{ name: "TestEvent" }] as any }));

  test("deve construir e executar um fluxo completo com sucesso", async () => {
    const useCase = UseCasePipeline.build<MockCommand, MockContext, MockAggregate, boolean>({
      // 1. Parse
      parse: (cmd) => {
        if (cmd.value < 0) return Result.err("valor negativo");
        return Result.ok({ id: parseInt(cmd.id), value: cmd.value });
      },

      // 2. Handle
      handle: function* (ctx) {
        // Simula logica async
        const loaded = yield Promise.resolve(Result.ok({ id: ctx.id, total: 0 }));
        const updated = { ...loaded, total: loaded.total + ctx.value };
        return Result.ok({ aggregate: updated, result: true });
      },

      // 3. Infra
      repository: mockRepo,
      eventBus: mockBus,
      pullEvents: mockPull
    });

    const result = await useCase.execute({ id: "1", value: 100 });

    expect(Result.isOk(result)).toBe(true);
    expect(Result.unwrap(result)).toBe(true);
    
    // Verifica chamadas de infra
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockBus.publish).toHaveBeenCalled();
    expect(mockPull).toHaveBeenCalled();
  });

  test("deve falhar se o passo 'parse' falhar", async () => {
    const useCase = UseCasePipeline.build({
      parse: () => Result.err("erro de parse"),
      handle: function* () { return Result.ok({} as any) }
    });

    const result = await useCase.execute({} as any);
    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("erro de parse");
  });

  test("deve falhar se o passo 'handle' falhar", async () => {
    const useCase = UseCasePipeline.build({
      parse: (cmd) => Result.ok(cmd),
      handle: function* () {
        yield Result.err("erro de negocio"); // Short-circuit
        return Result.ok({} as any);
      }
    });

    const result = await useCase.execute({} as any);
    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("erro de negocio");
  });
});
