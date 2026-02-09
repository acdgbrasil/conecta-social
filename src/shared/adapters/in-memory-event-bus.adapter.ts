import type { DomainEvent, EventBusPort, EventHandler } from "@conecta/ports";
import { Result } from "@conecta/result";

/**
 * Event bus in-memory para testes e sandboxes.
 */
export const inMemoryEventBus = (): EventBusPort & {
  readonly published: ReadonlyArray<DomainEvent>;
  clear(): void;
} => {
  const buffer: DomainEvent[] = [];
  const handlers = new Map<string, EventHandler[]>();

  return {
    publish: async (event: DomainEvent | DomainEvent[]) => {
      const events = Array.isArray(event) ? event : [event];
      buffer.push(...events);

      for (const e of events) {
        const eventHandlers = handlers.get(e.name) || [];
        for (const handler of eventHandlers) {
          await handler.handle(e);
        }
      }

      return Result.ok(undefined);
    },
    subscribe: (eventName, handler) => {
      const eventHandlers = handlers.get(eventName) || [];
      eventHandlers.push(handler as EventHandler);
      handlers.set(eventName, eventHandlers);
    },
    get published() {
      return buffer;
    },
    clear: () => {
      buffer.length = 0;
      handlers.clear();
    },
  };
};
