import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";

export type DomainEvent = {
  name: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  id?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Contrato para o tratador de eventos.
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = {
  handle(event: T): Promise<void>;
};

/**
 * Contrato para publicação e subscrição de eventos de domínio.
 */
export type EventBusPort = {
  publish(
    event: DomainEvent | DomainEvent[],
  ): Promise<Result<void, DomainError>>;

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>,
  ): void;
};
