import { uuidV7Provider } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error";
import type { IdProviderPort } from "@conecta/ports";
import { err, ok, type Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { PID } from "../errors/PersonId.error";

export class PersonId {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  public static create(): Result<PersonId, DomainError>;
  public static create(value: string): Result<PersonId, DomainError>;
  public static create(
    value?: string,
    idProvider: IdProviderPort = uuidV7Provider,
  ): Result<PersonId, DomainError> {
    if (typeof value === "undefined") {
      const generated = idProvider.generate();
      const candidate = Uuid.create(generated);
      if (candidate.isErr) return err(PID.InvalidFormat(generated));
      return ok(new PersonId(candidate.value.toString()));
    }
    const normalized = value.toLowerCase().trim();
    if (!Uuid.isV7(normalized)) return err(PID.InvalidFormat(normalized));
    return ok(new PersonId(normalized));
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: PersonId): boolean {
    return this.value === other.value;
  }
}
