import { describe, expect, test, mock } from "bun:test";
import { Result } from "@conecta/result";
import { UseCasePipeline } from "@conecta/fn";

type MockCommand = { id: string; value: number };
type MockContext = { id: number; value: number };
type MockAggregate = { id: number; total: number };
const makeEvent = (name: string) => ({ name, payload: {}, occurredAt: new Date() });

describe("UseCasePipeline (Constructor)", () => {
  const makeUseCase = (deps?: {
    repository?: { save: ReturnType<typeof mock> };
    eventBus?: { publish: ReturnType<typeof mock> };
    pullEvents?: ReturnType<typeof mock>;
  }) =>
    UseCasePipeline.build<MockCommand, MockContext, MockAggregate, boolean, string>({
      parse: (cmd) => {
        if (cmd.value < 0) return Result.err("valor negativo");
        return Result.ok({ id: parseInt(cmd.id, 10), value: cmd.value });
      },

      handle: async function* (ctx) {
        const loaded = yield Promise.resolve(Result.ok({ id: ctx.id, total: 0 }));
        const updated = { ...loaded, total: loaded.total + ctx.value };
        return Result.ok({ aggregate: updated, result: true });
      },

      repository: deps?.repository,
      eventBus: deps?.eventBus,
      pullEvents: deps?.pullEvents,
    });

  test("deve construir e executar um fluxo completo com sucesso", async () => {
    const aggregateFromHandle: MockAggregate = { id: 1, total: 100 };
    const cleanedAggregate: MockAggregate = { id: 1, total: 90 };
    const extractedEvents = [makeEvent("TestEvent")];
    const mockRepo = { save: mock(async () => Result.ok(undefined)) };
    const mockBus = { publish: mock(async () => Result.ok(undefined)) };
    const mockPull = mock((aggregate: MockAggregate) => {
      expect(aggregate).toEqual(aggregateFromHandle);
      return {
        aggregate: cleanedAggregate,
        events: extractedEvents,
      };
    });
    const useCase = UseCasePipeline.build<MockCommand, MockContext, MockAggregate, boolean, string>({
      parse: (cmd) => {
        if (cmd.value < 0) return Result.err("valor negativo");
        return Result.ok({ id: parseInt(cmd.id, 10), value: cmd.value });
      },
      handle: async function* () {
        return Result.ok({ aggregate: aggregateFromHandle, result: true });
      },
      repository: mockRepo,
      eventBus: mockBus,
      pullEvents: mockPull,
    });

    const result = await useCase.execute({ id: "1", value: 100 });

    expect(Result.isOk(result)).toBe(true);
    expect(Result.unwrap(result)).toBe(true);
    expect(mockPull).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledWith(cleanedAggregate);
    expect(mockBus.publish).toHaveBeenCalledTimes(1);
    expect(mockBus.publish).toHaveBeenCalledWith(extractedEvents);
  });

  test("deve manter sucesso quando publish retorna Result.err (persistencia ja concluida)", async () => {
    const mockRepo = { save: mock(async () => Result.ok(undefined)) };
    const mockBus = { publish: mock(async () => Result.err("publish-failed")) };
    const mockPull = mock((aggregate: MockAggregate) => ({
      aggregate,
      events: [makeEvent("TestEvent")],
    }));
    const originalConsoleError = console.error;
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy as unknown as typeof console.error;

    try {
      const useCase = makeUseCase({
        repository: mockRepo,
        eventBus: mockBus,
        pullEvents: mockPull,
      });

      const result = await useCase.execute({ id: "2", value: 10 });

      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result)).toBe(true);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockBus.publish).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test("deve manter sucesso quando publish lanca excecao (persistencia ja concluida)", async () => {
    const mockRepo = { save: mock(async () => Result.ok(undefined)) };
    const mockBus = {
      publish: mock(async () => {
        throw new Error("publish-exception");
      }),
    };
    const mockPull = mock((aggregate: MockAggregate) => ({
      aggregate,
      events: [makeEvent("TestEvent")],
    }));
    const originalConsoleError = console.error;
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy as unknown as typeof console.error;

    try {
      const useCase = makeUseCase({
        repository: mockRepo,
        eventBus: mockBus,
        pullEvents: mockPull,
      });

      const result = await useCase.execute({ id: "3", value: 10 });

      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result)).toBe(true);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockBus.publish).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test("deve extrair eventos antes de salvar, persistindo o agregado retornado por pullEvents", async () => {
    const callOrder: string[] = [];
    const aggregateFromHandle: MockAggregate = { id: 10, total: 20 };
    const cleanedAggregate: MockAggregate = { id: 10, total: 999 };
    const extractedEvents = [makeEvent("PulledEvent")];

    const mockRepo = {
      save: mock(async (aggregate: MockAggregate) => {
        callOrder.push("save");
        expect(aggregate).toEqual(cleanedAggregate);
        return Result.ok(undefined);
      }),
    };
    const mockBus = {
      publish: mock(async (events: readonly ReturnType<typeof makeEvent>[]) => {
        callOrder.push("publish");
        expect(events).toEqual(extractedEvents);
        return Result.ok(undefined);
      }),
    };
    const mockPull = mock((aggregate: MockAggregate) => {
      callOrder.push("pull");
      expect(aggregate).toEqual(aggregateFromHandle);
      return {
        aggregate: cleanedAggregate,
        events: extractedEvents,
      };
    });

    const useCase = UseCasePipeline.build<MockCommand, MockContext, MockAggregate, boolean>({
      parse: (cmd) => Result.ok({ id: parseInt(cmd.id, 10), value: cmd.value }),
      handle: async function* () {
        return Result.ok({ aggregate: aggregateFromHandle, result: true });
      },
      repository: mockRepo,
      eventBus: mockBus,
      pullEvents: mockPull,
    });

    const result = await useCase.execute({ id: "10", value: 1 });

    expect(Result.isOk(result)).toBe(true);
    expect(Result.unwrap(result)).toBe(true);
    expect(callOrder).toEqual(["pull", "save", "publish"]);
  });

  test("deve falhar se o passo 'parse' falhar", async () => {
    const useCase = UseCasePipeline.build({
      parse: () => Result.err("erro de parse"),
      handle: async function* () {
        return Result.ok({} as any);
      },
    });

    const result = await useCase.execute({} as any);
    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("erro de parse");
  });

  test("deve falhar se o passo 'handle' falhar", async () => {
    const useCase = UseCasePipeline.build<any, any, any, any, string>({
      parse: (cmd) => Result.ok(cmd),
      handle: async function* () {
        yield Result.err("erro de negocio");
        return Result.ok({} as any);
      },
    });

    const result = await useCase.execute({} as any);
    expect(Result.isErr(result)).toBe(true);
    expect(Result.unwrapErr(result)).toBe("erro de negocio");
  });
});
