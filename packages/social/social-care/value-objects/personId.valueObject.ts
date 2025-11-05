import { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { PID } from "../err/PersonId.error";

export class PersonId {
    private constructor(readonly value: string) {
        Object.freeze(this);
    }

    public static create(): Result<PersonId, DomainError>;
    public static create(value: string): Result<PersonId, DomainError>;
    public static create(value?: string): Result<PersonId, DomainError> {
        if (typeof value === "undefined") {
            return ok(new PersonId(Uuid.create().unwrap().toString()));
        }
        if (!Uuid.isV7(value)) {
            return err(PID.InvalidFormat(value));
        }
        return ok(new PersonId(value));
    }

    public toString(): string {
        return this.value;
    }

    public equals(other: PersonId): boolean {
        return this.value === other.value;
    }
}
