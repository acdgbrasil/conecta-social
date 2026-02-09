import { uuidV7Provider } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Branded } from "@conecta/fn";
import type { IdProviderPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { FMIE } from "../errors/FamilyMemberId.error";

// 1. Tipo
export type FamilyMemberId = Branded<string, "FamilyMemberId">;

// 2. Namespace
export const FamilyMemberId = {
  create(
    value?: string,
    idProvider: IdProviderPort = uuidV7Provider,
  ): Result<FamilyMemberId, DomainError> {
    if (value === undefined) {
      const fresh = idProvider.generate();
      const uuid = Uuid.create(fresh);
      if (Result.isErr(uuid)) return Result.err(FMIE.InvalidFormat(fresh));
      return Result.ok(uuid.value.toString() as FamilyMemberId);
    }

    const normalized = value.toLowerCase();

    if (!Uuid.isV7(normalized)) {
      return Result.err(FMIE.InvalidFormat(normalized));
    }

    return Result.ok(normalized as FamilyMemberId);
  },

  equals(a: FamilyMemberId, b: FamilyMemberId): boolean {
    return a === b;
  }
} as const;
