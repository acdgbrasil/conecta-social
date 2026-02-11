import { Result } from "@conecta/result";
import type { SqlPort, SqlTransaction } from "@conecta/ports";
import type { Patient } from "@conecta/social-care/domain/entities";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import { PatientPersistenceMapper } from "./patient.mapper";
import { enqueueOutboxEvents } from "../../outbox/postgres-outbox.repository";
import { AppError } from "@conecta/social-care/application/errors/application.error";

/**
 * Adaptador de Persistência Funcional (Actions) para o Agregado Patient.
 * Segue o padrão Ports & Adapters e garante Atomicidade via Outbox.
 */
export const makePatientPersistenceAdapter = (sql: SqlPort): PatientRepositoryPort => ({
  /**
   * Salva o agregado e seus eventos de forma atômica (Transaction).
   */
  save: async (patient: Patient) => {
    try {
      const persistenceModel = PatientPersistenceMapper.toPersistence(patient);

      return await sql.begin(async (tx: SqlTransaction) => {
        // 1. Persiste o Agregado (Upsert)
        await tx`
          INSERT INTO patients (
            id, 
            person_id, 
            housing_condition, 
            socioeconomic_situation,
            updated_at
          ) VALUES (
            ${persistenceModel.id}, 
            ${persistenceModel.person_id}, 
            ${persistenceModel.housing_condition}, 
            ${persistenceModel.socioeconomic_situation},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            housing_condition = EXCLUDED.housing_condition,
            socioeconomic_situation = EXCLUDED.socioeconomic_situation,
            updated_at = NOW();
        `;

        // 2. Persiste os eventos no Outbox (Obrigatório - Mesma Transação)
        // Note: O UseCasePipeline já deve ter extraído os eventos, 
        // mas aqui garantimos a integridade se o agregado tiver eventos pendentes.
        const events = (patient as any).pullDomainEvents?.()?.events ?? [];
        if (events.length > 0) {
          await enqueueOutboxEvents(tx, {
            aggregateId: persistenceModel.id,
            aggregateType: "Patient",
            events
          });
        }

        return Result.ok(undefined);
      });
    } catch (error) {
      console.error("[PostgresAdapter] Erro ao salvar paciente:", error);
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  existsByPersonId: async (personId: string) => {
    try {
      const rows = await sql`
        SELECT 1 FROM patients WHERE person_id = ${personId} LIMIT 1
      `;
      return Result.ok(rows.length > 0);
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  findByPersonId: async (personId: string) => {
    try {
      const rows = await sql`
        SELECT * FROM patients WHERE person_id = ${personId} LIMIT 1
      `;
      
      if (rows.length === 0) {
        return Result.err(AppError.PatientNotFound?.() ?? { message: "Patient not found" });
      }

      return PatientPersistenceMapper.toDomain(rows[0]);
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  // Implementação do findById conforme solicitado na TASK-001
  findById: async (id: string) => {
    try {
      const rows = await sql`
        SELECT * FROM patients WHERE id = ${id} LIMIT 1
      `;
      if (rows.length === 0) return Result.err(AppError.PatientNotFound?.() ?? { message: "Patient not found" });
      return PatientPersistenceMapper.toDomain(rows[0]);
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  }
});
