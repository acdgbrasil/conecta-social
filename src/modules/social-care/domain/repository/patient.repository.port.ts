import type { Result } from "@conecta/shared";
import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";
import type { Patient } from "@conecta/social-care/domain/entities";
import type { PersonId } from "@conecta/social-care/domain/value-objects";


/**
 * Contrato para o Repositório de Pacientes.
 * Focado na persistência do Agregado completo para manter invariantes.
 */
export type PatientRepositoryPort = {
  /** Salva ou atualiza o agregado completo. */
  save(patient: Patient): Promise<Result<void, DomainError>>;
  
  /** Verifica se já existe um paciente para o ID de pessoa informado. */
  existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>>;
  
  /** Recupera o agregado completo pelo ID de pessoa. */
  findByPersonId(personId: PersonId): Promise<Result<Patient, DomainError>>;  
}
