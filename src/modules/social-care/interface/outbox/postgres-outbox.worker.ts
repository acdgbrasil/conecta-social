import { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { DomainEvent, EventBusPort, SqlPort } from "@conecta/ports";
import { AppError } from "@conecta/social-care/application/errors/application.error";

const parseJson = (value: unknown): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === "string") return JSON.parse(value) as Record<string, unknown>;
  return value as Record<string, unknown>;
};

type OutboxRow = {
  id: string;
  event_name: string;
  payload: unknown;
  metadata: unknown | null;
  occurred_at: Date | string;
};

export class PostgresOutboxWorker {
  constructor(
    private readonly sql: SqlPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async processBatch(
    batchSize: number = 50,
  ): Promise<Result<number, DomainError>> {
    try {
      const rows = await this.sql.begin(async (tx) => {
        const pending = (await tx`
          SELECT id, event_name, payload, metadata, occurred_at
          FROM outbox_events
          WHERE status = 'PENDING'
          ORDER BY occurred_at ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        `) as OutboxRow[];

        if (pending.length === 0) return [] as OutboxRow[];

        for (const row of pending) {
          await tx`
            UPDATE outbox_events
            SET status = 'PROCESSING', attempts = attempts + 1
            WHERE id = ${row.id}
          `;
        }

        return pending;
      });

      if (rows.length === 0) return Result.ok(0);

      const events: DomainEvent[] = rows.map((row) => ({
        id: row.id,
        name: row.event_name,
        payload: parseJson(row.payload),
        metadata: row.metadata ? parseJson(row.metadata) : undefined,
        occurredAt: new Date(row.occurred_at),
      }));

      const publishResult = await this.eventBus.publish(events);
      if (Result.isErr(publishResult)) {
        for (const row of rows) {
          await this.sql`
            UPDATE outbox_events
            SET status = 'FAILED', last_error = ${publishResult.error.message ?? "Publish failed"}
            WHERE id = ${row.id}
          `;
        }
        return Result.err(publishResult.error);
      }

      for (const row of rows) {
        await this.sql`
          UPDATE outbox_events
          SET status = 'PROCESSED', processed_at = NOW()
          WHERE id = ${row.id}
        `;
      }

      return Result.ok(rows.length);
    } catch (error) {
      console.error("Erro ao processar outbox:", error);
      return Result.err(AppError.RepositoryNotAvailable());
    }
  }
}
