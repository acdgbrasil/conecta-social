import type { DomainEvent, EventBusPort } from "@conecta/ports";
import { Result } from "@conecta/result";

/**
 * Event bus in-memory para testes e sandboxes.
 */
export const inMemoryEventBus = (): EventBusPort & {
  readonly published: ReadonlyArray<DomainEvent>;
  clear(): void;
} => {
  const buffer: DomainEvent[] = [];

  return {
    publish: async (event: DomainEvent | DomainEvent[]) => {
      const events = Array.isArray(event) ? event : [event];
      buffer.push(...events);
      return Result.ok(undefined);
    },
    get published() {
      return buffer;
    },
    clear: () => {
      buffer.length = 0;
    },
  };
};
