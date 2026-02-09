import { describe, expect, test, mock } from "bun:test";
import { createBunEventBus } from "@conecta/adapters";
import { Result } from "@conecta/result";

describe("BunEventBus Adapter", () => {
  test("deve publicar e submeter a um evento com sucesso", async () => {
    const bus = createBunEventBus();
    const eventName = "TestEvent";
    const payload = { data: "test" };
    const occurredAt = new Date();

    let receivedEvent: any = null;
    const handler = {
      handle: async (event: any) => {
        receivedEvent = event;
      },
    };

    bus.subscribe(eventName, handler);

    const publishResult = await bus.publish({
      name: eventName,
      payload,
      occurredAt,
    });

    expect(Result.isOk(publishResult)).toBe(true);
    // Aguarda processamento async se necessário (embora EventTarget seja sincrono no dispatch)
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent.name).toBe(eventName);
    expect(receivedEvent.payload).toEqual(payload);
  });

  test("deve lidar com erros no handler sem quebrar o barramento", async () => {
    const bus = createBunEventBus();
    const eventName = "ErrorEvent";

    const consoleSpy = mock((...args: any[]) => {});
    const originalConsoleError = console.error;
    console.error = consoleSpy as unknown as typeof console.error;

    try {
      const handler = {
        handle: async () => {
          throw new Error("Boom!");
        },
      };

      bus.subscribe(eventName, handler);

      await bus.publish({
        name: eventName,
        payload: {},
        occurredAt: new Date(),
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(consoleSpy).toHaveBeenCalled();
    } finally {
      console.error = originalConsoleError;
    }
  });

  test("deve permitir unsubscribe para evitar handlers pendurados", async () => {
    const bus = createBunEventBus();
    const eventName = "UnsubEvent";
    const handler = {
      handle: mock(async () => {}),
    };

    const subscription = bus.subscribe(eventName, handler);
    subscription.unsubscribe();

    const publishResult = await bus.publish({
      name: eventName,
      payload: { ok: true },
      occurredAt: new Date(),
    });

    expect(Result.isOk(publishResult)).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(handler.handle).not.toHaveBeenCalled();
  });
});
