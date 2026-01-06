import { DomainError, PersonId, Result } from "src";

export interface PatientRepositoryProtocol {
  save(): Promise<Result<void,DomainError>>;
  existsByPersonId(personId: PersonId): Promise<Result<boolean,DomainError>>;
}