import { Result } from "@conecta/shared";
import { Uuid } from "@conecta/shared/uuid-pattern/uuid";
import type { DomainEvent } from "@conecta/shared/ports/event-bus.port";

/**
 * Cria a estrutura base de um evento de domínio com ID único.
 */
export const makeEvent = (
  name: string,
  payload: Record<string, unknown>,
  occurredAt: Date,
): DomainEvent => ({
  name,
  id: Result.unwrap(Uuid.create(Uuid.v7().uuid)).toString(),
  occurredAt,
  payload,
});
