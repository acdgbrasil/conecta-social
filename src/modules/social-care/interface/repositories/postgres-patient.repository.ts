import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import type { PatientRepositoryPort } from "../../domain/repository/patient.repository.protocol";
import type { FamilyMemberProps, Patient, PersonId } from "../../index";
import { AppError } from "../../application/errors/application.error";
import { enqueueOutboxEvents } from "../outbox/postgres-outbox.repository";
import {
  mapPatientPersistenceToDomain,
  mapPatientToPersistence,
  type DiagnosisRow,
  type FamilyMemberRow,
  type PatientRow,
  type ReferralRow,
  type RightsViolationReportRow,
  type SocialCareAppointmentRow,
} from "../adapter/mappers/persistence/patient.persistence.mapper";

import type { SqlPort } from "@conecta/ports";

export class PostgresPatientRepository implements PatientRepositoryPort {
  constructor(private readonly sql: SqlPort) {}

  /**
   * Persiste o Agregado Patient e suas entidades filhas de forma atômica.
   * Utiliza transação para garantir integridade.
   */
  async save(patient: Patient): Promise<Result<void, DomainError>> {
    try {
      const snapshot = mapPatientToPersistence(patient);

      await this.sql.begin(async (tx: any) => {
        // 1. Upsert na Raiz (Patient)
        // Como JSONB, salvamos os VOs complexos diretamente.
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
            ${snapshot.patient.id},
            ${snapshot.patient.person_id},
            ${snapshot.patient.housing_condition ? JSON.stringify(snapshot.patient.housing_condition) : null},
            ${snapshot.patient.socioeconomic_situation ? JSON.stringify(snapshot.patient.socioeconomic_situation) : null},
            ${snapshot.patient.community_support_network ? JSON.stringify(snapshot.patient.community_support_network) : null},
            ${snapshot.patient.social_health_summary ? JSON.stringify(snapshot.patient.social_health_summary) : null},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            housing_condition = EXCLUDED.housing_condition,
            socioeconomic_situation = EXCLUDED.socioeconomic_situation,
            community_support_network = EXCLUDED.community_support_network,
            social_health_summary = EXCLUDED.social_health_summary,
            updated_at = NOW();
        `;

        // 2. Sincronizar Diagnósticos (Estratégia: Delete All + Insert All para simplicidade, 
        // dado que a lista não deve ser gigante. Se crescer muito, mudar para diff).
        await tx`DELETE FROM patient_diagnoses WHERE patient_id = ${snapshot.patient.id}`;
        
        if (snapshot.diagnoses.length > 0) {
          for (const diag of snapshot.diagnoses) {
            await tx`
              INSERT INTO patient_diagnoses (patient_id, icd_code, diagnosis_date, description)
              VALUES (
                ${diag.patient_id},
                ${diag.icd_code},
                ${diag.diagnosis_date},
                ${diag.description}
              )
            `;
          }
        }

        // 3. Sincronizar Membros da Família (Mesma estratégia de substituição total para garantir consistência)
        await tx`DELETE FROM family_members WHERE patient_id = ${snapshot.patient.id}`;
        
        if (snapshot.familyMembers.length > 0) {
          for (const member of snapshot.familyMembers) {
            await tx`
              INSERT INTO family_members (
                id, patient_id, person_id, relationship, 
                is_primary_caregiver, resides_with_patient
              ) VALUES (
                ${member.id},
                ${member.patient_id},
                ${member.person_id},
                ${member.relationship},
                ${member.is_primary_caregiver},
                ${member.resides_with_patient}
              )
            `;
          }
        }

        // 4. Sincronizar Atendimentos (Append-Only com ID)
        if (snapshot.appointments.length > 0) {
           for (const app of snapshot.appointments) {
             await tx`
               INSERT INTO social_care_appointments (
                 id, patient_id, professional_in_charge_id, appointment_date, 
                 summary, action_plan, appointment_type
               ) VALUES (
                 ${app.id},
                 ${app.patient_id},
                 ${app.professional_in_charge_id},
                 ${app.appointment_date},
                 ${app.summary},
                 ${app.action_plan},
                 ${app.appointment_type}
               )
               ON CONFLICT (id) DO UPDATE SET
                 summary = EXCLUDED.summary,
                 action_plan = EXCLUDED.action_plan,
                 appointment_type = EXCLUDED.appointment_type;
             `;
           }
        }

        // 5. Sincronizar Encaminhamentos
        if (snapshot.referrals.length > 0) {
          for (const ref of snapshot.referrals) {
            await tx`
              INSERT INTO referrals (
                id, patient_id, referred_person_id, destination_service,
                reason, status, requesting_professional_id, referral_date
              ) VALUES (
                ${ref.id},
                ${ref.patient_id},
                ${ref.referred_person_id},
                ${ref.destination_service},
                ${ref.reason},
                ${ref.status},
                ${ref.requesting_professional_id},
                ${ref.referral_date}
              )
              ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                destination_service = EXCLUDED.destination_service,
                reason = EXCLUDED.reason;
            `;
          }
        }

        // 6. Sincronizar Relatos de Violação
        if (snapshot.violations.length > 0) {
          for (const v of snapshot.violations) {
            await tx`
              INSERT INTO rights_violation_reports (
                id, patient_id, victim_id, violation_type,
                description_of_fact, incident_date, report_date, actions_taken
              ) VALUES (
                ${v.id},
                ${v.patient_id},
                ${v.victim_id},
                ${v.violation_type},
                ${v.description_of_fact},
                ${v.incident_date},
                ${v.report_date},
                ${v.actions_taken}
              )
              ON CONFLICT (id) DO UPDATE SET
                actions_taken = EXCLUDED.actions_taken,
                description_of_fact = EXCLUDED.description_of_fact;
            `;
          }
        }

        // 7. Outbox: persistir eventos do agregado na mesma transação
        await enqueueOutboxEvents(tx, {
          aggregateId: patient.id.toString(),
          aggregateType: "Patient",
          events: patient.domainEvents,
        });
      });

      return ok(undefined);
    } catch (error) {
      console.error("Erro ao salvar paciente no Postgres:", error);
      return err(AppError.RepositoryNotAvailable());
    }
  }

  async addFamilyMember(
    familyMember: FamilyMemberProps,
  ): Promise<Result<void, DomainError>> {
     // Este método é redundante se usamos o save() do agregado completo.
     // Mas se for uma otimização, implementamos insert direto.
     // Por consistência com DDD Rich Domain, preferimos carregar -> adicionar -> salvar.
     // Então deixaremos lançar erro ou implementaremos via save.
     throw new Error("Use patient.addFamilyMember() + repo.save() instead.");
  }

  async existsByPersonId(
    personId: PersonId,
  ): Promise<Result<boolean, DomainError>> {
    try {
      const result = await this.sql`
        SELECT 1 FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
      `;
      return ok(result.length > 0);
    } catch (error) {
      return err(AppError.RepositoryNotAvailable());
    }
  }

  async findByPersonId(
    personId: PersonId,
  ): Promise<Result<Patient, DomainError>> {
    try {
      // 1. Buscar Raiz
      const patientRows = await this.sql<PatientRow[]>`
        SELECT * FROM patients WHERE person_id = ${personId.toString()} LIMIT 1
      `;

      if (patientRows.length === 0) {
        // Retornar NotFound via DomainError seria melhor, mas AppError.RepositoryNotAvailable serve por ora.
        return err(AppError.RepositoryNotAvailable());
      }

      const row = patientRows[0];
      const patientId = row.id;

      // 2. Buscar Entidades Filhas em Paralelo para Performance
      const [diagRows, famRows, appRows, refRows, violRows] = await Promise.all([
        this.sql<DiagnosisRow[]>`SELECT * FROM patient_diagnoses WHERE patient_id = ${patientId}`,
        this.sql<FamilyMemberRow[]>`SELECT * FROM family_members WHERE patient_id = ${patientId}`,
        this.sql<SocialCareAppointmentRow[]>`SELECT * FROM social_care_appointments WHERE patient_id = ${patientId}`,
        this.sql<ReferralRow[]>`SELECT * FROM referrals WHERE patient_id = ${patientId}`,
        this.sql<RightsViolationReportRow[]>`SELECT * FROM rights_violation_reports WHERE patient_id = ${patientId}`
      ]);
      const patientResult = mapPatientPersistenceToDomain({
        patient: row,
        diagnoses: diagRows,
        familyMembers: famRows,
        appointments: appRows,
        referrals: refRows,
        violations: violRows,
      });

      if (patientResult.isErr) return err(patientResult.error);

      return ok(patientResult.value);

    } catch (error) {
      console.error("Erro no findByPersonId:", error);
      return err(AppError.RepositoryNotAvailable());
    }
  }
}
