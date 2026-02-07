import { describe, expect, it } from "bun:test";
import { systemClock, uuidV7Provider, noopNotifier, inMemoryEventBus } from "@conecta/adapters";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

describe("Infrastructure Adapters (Unit)", () => {
  describe("systemClock", () => {
    it("now() deve retornar um objeto Date", () => {
      expect(systemClock.now()).toBeInstanceOf(Date);
    });

    it("nowIsoString() deve retornar uma string ISO válida", () => {
      const iso = systemClock.nowIsoString();
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });

  describe("uuidV7Provider", () => {
    it("generate() deve retornar um UUID v7 válido", () => {
      const id = uuidV7Provider.generate();
      expect(Uuid.isValid(id)).toBe(true);
    });
  });

  describe("noopNotifier", () => {
    it("notify() deve sempre retornar sucesso", async () => {
      const result = await noopNotifier.notify({
        channel: "email",
        recipient: "test@test.com",
        body: "hello"
      });
      expect(Result.isOk(result)).toBe(true);
    });
  });

  describe("inMemoryEventBus", () => {
    it("deve publicar e armazenar eventos", async () => {
      const bus = inMemoryEventBus();
      const event = { name: "Test", payload: {}, occurredAt: new Date() };
      
      await bus.publish(event);
      expect(bus.published).toHaveLength(1);
      expect(bus.published[0]).toBe(event);
    });

    it("deve permitir limpar o buffer", async () => {
      const bus = inMemoryEventBus();
      await bus.publish({ name: "Test", payload: {}, occurredAt: new Date() });
      
      bus.clear();
      expect(bus.published).toHaveLength(0);
    });

    it("deve suportar múltiplos eventos", async () => {
      const bus = inMemoryEventBus();
      const events = [
        { name: "E1", payload: {}, occurredAt: new Date() },
        { name: "E2", payload: {}, occurredAt: new Date() }
      ];
      
      await bus.publish(events);
      expect(bus.published).toHaveLength(2);
    });
  });
});
