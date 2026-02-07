import type { DomainError } from "@conecta/domain-error";
import type { Result } from "@conecta/result";
import type {
  Patient,
  PersonId,
} from "@conecta/social-care";

/**
 * Contrato para o Repositório de Pacientes.
 * Focado na persistência do Agregado completo para manter invariantes.
 */
export interface PatientRepositoryPort {
  /** Salva ou atualiza o agregado completo. */
  save(patient: Patient): Promise<Result<void, DomainError>>;
  
  /** Verifica se já existe um paciente para o ID de pessoa informado. */
  existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>>;
  
  /** Recupera o agregado completo pelo ID de pessoa. */
  findByPersonId(personId: PersonId): Promise<Result<Patient, DomainError>>;  
}