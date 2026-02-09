import type { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error/DomainError";

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<any>;

export type SqlTransaction = SqlTag & {
  // Poderia ter outros métodos como savepoint, etc.
};

export type SqlPort = SqlTag & {
  begin<T>(
    fn: (tx: SqlTransaction) => Promise<T>
  ): Promise<T>;
  close(): Promise<void>;
};