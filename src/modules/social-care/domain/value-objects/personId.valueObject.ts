import { uuidV7Provider } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Branded } from "@conecta/fn";
import type { IdProviderPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { PID } from "../errors/PersonId.error";

// 1. Definição do Tipo (Branded Primitivo)
export type PersonId = Branded<string, "PersonId">;

// 2. Namespace de Funções Puras
export const PersonId = {
  create(
    value?: string,
    idProvider: IdProviderPort = uuidV7Provider,
  ): Result<PersonId, DomainError> {
    if (value === undefined) {
      const generated = idProvider.generate();
      const candidate = Uuid.create(generated);
      if (Result.isErr(candidate)) return Result.err(PID.InvalidFormat(generated));
      return Result.ok(candidate.value.toString() as PersonId);
    }

    const normalized = value.trim().toLowerCase();
    if (!Uuid.isV7(normalized)) {
      return Result.err(PID.InvalidFormat(normalized));
    }

    return Result.ok(normalized as PersonId);
  },

  equals(a: PersonId, b: PersonId): boolean {
    return a === b;
  },

  // Helper opcional para compatibilidade durante migração
  toString(id: PersonId): string {
    return id;
  }
} as const;
