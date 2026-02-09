import { Result } from "@conecta/result";
import type { DomainEvent, SqlTransaction } from "@conecta/ports";
import { Uuid } from "@conecta/uuid";

export type OutboxInsertContext = {
  aggregateId: string;
  aggregateType: string;
  events: ReadonlyArray<DomainEvent>;
};

const normalizeJson = (value: unknown): string => {
  return JSON.stringify(value ?? {});
};

export const enqueueOutboxEvents = async (
  tx: SqlTransaction,
  ctx: OutboxInsertContext,
): Promise<void> => {
  if (ctx.events.length === 0) return;

  for (const event of ctx.events) {
    const eventId = event.id ?? Result.unwrap(Uuid.create()).toString();
    await tx`
      INSERT INTO outbox_events (
        id,
        aggregate_id,
        aggregate_type,
        event_name,
        payload,
        metadata,
        occurred_at
      ) VALUES (
        ${eventId},
        ${ctx.aggregateId},
        ${ctx.aggregateType},
        ${event.name},
        ${normalizeJson(event.payload)},
        ${event.metadata ? normalizeJson(event.metadata) : null},
        ${event.occurredAt}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }
};
