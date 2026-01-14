import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";
import type {
  FamilyMember,
  Patient,
  PersonId,
} from "packages/conecta-raros/social-care";

export interface PatientRepositoryProtocol {
  save(patient: Patient): Promise<Result<void, DomainError>>;
  addFamilyMember(
    familyMember: FamilyMember,
  ): Promise<Result<void, DomainError>>;
  existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>>;
}
