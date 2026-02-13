import type { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { Person } from "../entities/person";

/**
 * Contrato para persistência da entidade Person.
 */
export type PersonRepositoryPort = {
  readonly save: (person: Person) => Promise<Result<void, DomainError>>;
  readonly findByEmail: (email: string) => Promise<Result<Person, DomainError>>;
  readonly existsByTaxId: (taxId: string) => Promise<Result<boolean, DomainError>>;
};
