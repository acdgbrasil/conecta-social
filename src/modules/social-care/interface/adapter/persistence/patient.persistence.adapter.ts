import { Result } from "@conecta/result";
import type { SqlPort, SqlTransaction } from "@conecta/ports";
import type { Uuid } from "@conecta/uuid";
import type { Patient } from "@conecta/social-care/domain/entities";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import type { PersonId } from "@conecta/social-care/domain/value-objects";
import { PatientPersistenceMapper, type PatientPersistenceRow } from "./patient.mapper";
import { enqueueOutboxEvents } from "../../outbox/postgres-outbox.repository";
import { AppError } from "@conecta/social-care/application/errors/application.error";
import { P } from "@conecta/social-care/domain/errors/Patient.error";

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
            community_support_network,
            social_health_summary,
            updated_at
          ) VALUES (
            ${persistenceModel.id}, 
            ${persistenceModel.person_id}, 
            ${persistenceModel.housing_condition}, 
            ${persistenceModel.socioeconomic_situation},
            ${persistenceModel.community_support_network},
            ${persistenceModel.social_health_summary},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            housing_condition = EXCLUDED.housing_condition,
            socioeconomic_situation = EXCLUDED.socioeconomic_situation,
            community_support_network = EXCLUDED.community_support_network,
            social_health_summary = EXCLUDED.social_health_summary,
            updated_at = NOW();
        `;

        // 2. Persiste os eventos no Outbox (Obrigatório - Mesma Transação)
        const events = patient.events;
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

  existsByPersonId: async (personId: PersonId) => {
    try {
      const rows = await sql`
        SELECT 1 FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
      `;
      return Result.ok(rows.length > 0);
    } catch (error) {
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  findByPersonId: async (personId: PersonId) => {
    try {
      const rows = await sql<PatientPersistenceRow[]>`
        SELECT * FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
      `;
      
      if (rows.length === 0) {
        return Result.err(P.PatientNotFound({ id: personId.toString() }));
      }

      return PatientPersistenceMapper.toDomain(rows[0]);
    } catch (error) {
      console.error("[PostgresAdapter] Erro ao buscar paciente por personId:", error);
      return Result.err(AppError.RepositoryNotAvailable());
    }
  },

  findById: async (id: Uuid) => {
    try {
      const rows = await sql<PatientPersistenceRow[]>`
        SELECT * FROM patients WHERE id = ${id.toString()} LIMIT 1
      `;
      
      if (rows.length === 0) {
        return Result.err(P.PatientNotFound({ id: id.toString() }));
      }
      
      return PatientPersistenceMapper.toDomain(rows[0]);
    } catch (error) {
      console.error("[PostgresAdapter] Erro ao buscar paciente por id:", error);
      return Result.err(AppError.RepositoryNotAvailable());
    }
  }
});
