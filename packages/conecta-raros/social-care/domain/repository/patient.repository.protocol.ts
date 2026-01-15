import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";
import type {
  FamilyMemberProps,
  Patient,
  PersonId,
} from "packages/conecta-raros/social-care";

export interface PatientRepositoryProtocol {
  save(patient: Patient): Promise<Result<void, DomainError>>;
  addFamilyMember(
    familyMember: FamilyMemberProps,
  ): Promise<Result<void, DomainError>>;
  existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>>;
  findByPersonId(personId: PersonId): Promise<Result<Patient, DomainError>>;  
}
