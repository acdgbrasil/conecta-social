import { FamilyMember, Patient, PersonId } from "packages/conecta-raros/social-care";
import { Result } from "@conecta/result";
import { DomainError } from "@conecta/domain-error";

export interface PatientRepositoryProtocol {
  save(patient: Patient): Promise<Result<void,DomainError>>;
  addFamilyMember(familyMember: FamilyMember): Promise<Result<void,DomainError>>;
  existsByPersonId(personId: PersonId): Promise<Result<boolean,DomainError>>;
}