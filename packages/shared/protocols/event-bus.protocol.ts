import { DomainError } from "@conecta/domain-error";
import { Result } from "@conecta/result";

export type DomainEvent = {
  name: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  id?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Contrato para publicação de eventos de domínio.
 */
export type EventBusProtocol = {
  publish(event: DomainEvent | DomainEvent[]): Promise<Result<void, DomainError>>;
};
