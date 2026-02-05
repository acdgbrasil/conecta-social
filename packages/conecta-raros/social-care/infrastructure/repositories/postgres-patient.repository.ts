import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import {
  Patient,
  PersonId,
  FamilyMember,
  Diagnosis,
  ICDCode,
  Timestamp,
  type FamilyMemberProps,
  FamilyMemberId,
  Referral,
  RightsViolationReport,
  SocialCareAppointment,
  HousingCondition,
  SocioEconomicSituation,
} from "../../index";
import { None, Some, type Option } from "@conecta/option";
import type { PatientRepositoryProtocol } from "../../domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { AppError } from "../../application/errors/application.error";
import { Uuid } from "@conecta/uuid";

// Definição das interfaces de DTO do Banco de Dados para Type Safety
interface PatientTable {
  id: string;
  person_id: string;
  housing_condition: any;
  socioeconomic_situation: any;
  community_support_network: any;
  social_health_summary: any;
  created_at: Date;
  updated_at: Date;
}

interface DiagnosisTable {
  id: string;
  patient_id: string;
  icd_code: string;
  diagnosis_date: Date;
  description: string | null;
}

interface FamilyMemberTable {
  id: string;
  patient_id: string;
  person_id: string;
  relationship: string;
  is_primary_caregiver: boolean;
  resides_with_patient: boolean;
}

export class PostgresPatientRepository implements PatientRepositoryProtocol {
  constructor(private readonly sql: any) {}

  /**
   * Persiste o Agregado Patient e suas entidades filhas de forma atômica.
   * Utiliza transação para garantir integridade.
   */
  async save(patient: Patient): Promise<Result<void, DomainError>> {
    try {
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
            ${patient.id.toString()},
            ${patient.personId.toString()},
            ${patient.housingCondition.isSome ? JSON.stringify(patient.housingCondition.unwrap()) : null},
            ${patient.socioeconomicSituation.isSome ? JSON.stringify(patient.socioeconomicSituation.unwrap()) : null},
            ${patient.communitySupportNetwork.isSome ? JSON.stringify(patient.communitySupportNetwork.unwrap()) : null},
            ${patient.socialHealthSummary.isSome ? JSON.stringify(patient.socialHealthSummary.unwrap()) : null},
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
        await tx`DELETE FROM patient_diagnoses WHERE patient_id = ${patient.id.toString()}`;
        
        const diagnoses = patient.diagnoses.getAll();
        if (diagnoses.length > 0) {
          for (const diag of diagnoses) {
            await tx`
              INSERT INTO patient_diagnoses (patient_id, icd_code, diagnosis_date, description)
              VALUES (
                ${patient.id.toString()},
                ${diag.id.value},
                ${diag.date.value},
                ${diag.description || null}
              )
            `;
          }
        }

        // 3. Sincronizar Membros da Família (Mesma estratégia de substituição total para garantir consistência)
        await tx`DELETE FROM family_members WHERE patient_id = ${patient.id.toString()}`;
        
        const members = patient.familyMembers.getAll();
        if (members.length > 0) {
          for (const member of members) {
            await tx`
              INSERT INTO family_members (
                id, patient_id, person_id, relationship, 
                is_primary_caregiver, resides_with_patient
              ) VALUES (
                ${member.id.toString()},
                ${patient.id.toString()},
                ${member.personId.toString()},
                ${member.relationship},
                ${member.isPrimaryCaregiver},
                ${member.residesWithPatient}
              )
            `;
          }
        }

        // 4. Sincronizar Atendimentos (Append-Only com ID)
        const appointments = patient.appointments.getAll();
        if (appointments.length > 0) {
           for (const app of appointments) {
             await tx`
               INSERT INTO social_care_appointments (
                 id, patient_id, professional_in_charge_id, appointment_date, 
                 summary, action_plan, appointment_type
               ) VALUES (
                 ${app.id.toString()},
                 ${patient.id.toString()},
                 ${app.professionalInChargeId.toString()},
                 ${app.date.toDate()},
                 ${app.summary},
                 ${app.actionPlan},
                 ${app.type}
               )
               ON CONFLICT (id) DO UPDATE SET
                 summary = EXCLUDED.summary,
                 action_plan = EXCLUDED.action_plan,
                 appointment_type = EXCLUDED.appointment_type;
             `;
           }
        }

        // 5. Sincronizar Encaminhamentos
        const referrals = patient.referrals.getAll();
        if (referrals.length > 0) {
          for (const ref of referrals) {
            await tx`
              INSERT INTO referrals (
                id, patient_id, referred_person_id, destination_service,
                reason, status, requesting_professional_id, referral_date
              ) VALUES (
                ${ref.id.toString()},
                ${patient.id.toString()},
                ${ref.props.referredPersonId.toString()},
                ${ref.destinationService},
                ${ref.props.reason},
                ${ref.status},
                ${ref.props.requestingProfessionalId.toString()},
                ${ref.props.date.toDate()}
              )
              ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                destination_service = EXCLUDED.destination_service,
                reason = EXCLUDED.reason;
            `;
          }
        }

        // 6. Sincronizar Relatos de Violação
        const violations = patient.violationsReports.getAll();
        if (violations.length > 0) {
          for (const v of violations) {
            await tx`
              INSERT INTO rights_violation_reports (
                id, patient_id, victim_id, violation_type,
                description_of_fact, incident_date, report_date, actions_taken
              ) VALUES (
                ${v.id.toString()},
                ${patient.id.toString()},
                ${v.props.victimId.toString()},
                ${v.violationType},
                ${v.props.descriptionOfFact},
                ${v.props.incidentDate ? v.props.incidentDate.toDate() : null},
                ${v.props.reportDate.toDate()},
                ${v.actionsTaken}
              )
              ON CONFLICT (id) DO UPDATE SET
                actions_taken = EXCLUDED.actions_taken,
                description_of_fact = EXCLUDED.description_of_fact;
            `;
          }
        }
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
      const patientRows = await this.sql<PatientTable[]>`
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
        this.sql`SELECT * FROM patient_diagnoses WHERE patient_id = ${patientId}`,
        this.sql`SELECT * FROM family_members WHERE patient_id = ${patientId}`,
        this.sql`SELECT * FROM social_care_appointments WHERE patient_id = ${patientId}`,
        this.sql`SELECT * FROM referrals WHERE patient_id = ${patientId}`,
        this.sql`SELECT * FROM rights_violation_reports WHERE patient_id = ${patientId}`
      ]);

      // 3. Reconstruir Diagnósticos
      const diagnosesList: Diagnosis[] = [];
      for (const d of diagRows) {
        const icdResult = ICDCode.create(d.icd_code);
        const dateResult = Timestamp.create({ value: d.diagnosis_date });
        if (icdResult.isOk && dateResult.isOk) {
            const diagResult = Diagnosis.create({
                id: icdResult.value,
                date: dateResult.value,
                description: d.description || ""
            }, dateResult.value);
            if (diagResult.isOk) diagnosesList.push(diagResult.value);
        }
      }

      // 4. Reconstruir Família
      const familyList: FamilyMember[] = [];
      for (const f of famRows) {
        const fIdResult = FamilyMemberId.create(f.id);
        const fPersonIdResult = PersonId.create(f.person_id);
        
        if (fIdResult.isOk && fPersonIdResult.isOk) {
            const memberResult = FamilyMember.create({
                id: fIdResult.value,
                personId: fPersonIdResult.value,
                relationship: f.relationship,
                isPrimaryCaregiver: f.is_primary_caregiver,
                residesWithPatient: f.resides_with_patient
            });
            if (memberResult.isOk) familyList.push(memberResult.value);
        }
      }

      // 5. Reconstruir Atendimentos
      const appointmentsList: SocialCareAppointment[] = [];
      for (const a of appRows) {
          const aIdResult = Uuid.create(a.id);
          const profIdResult = Uuid.create(a.professional_in_charge_id);
          const dateResult = Timestamp.create({ value: a.appointment_date });
          if (aIdResult.isOk && profIdResult.isOk && dateResult.isOk) {
              const appResult = SocialCareAppointment.create({
                  id: aIdResult.value,
                  professionalInChargeId: profIdResult.value,
                  date: dateResult.value,
                  summary: a.summary,
                  actionPlan: a.action_plan,
                  type: a.appointment_type
              }, dateResult.value.toDate());
              if (appResult.isOk) appointmentsList.push(appResult.value);
          }
      }

      // 6. Reconstruir Encaminhamentos
      const referralsList: Referral[] = [];
      for (const r of refRows) {
          const rIdResult = Uuid.create(r.id);
          const refPersonIdResult = Uuid.create(r.referred_person_id);
          const dateResult = Timestamp.create({ value: r.referral_date });
          const profIdResult = Uuid.create(r.requesting_professional_id);
          if (rIdResult.isOk && refPersonIdResult.isOk && dateResult.isOk && profIdResult.isOk) {
              const refResult = Referral.create({
                  id: rIdResult.value,
                  referredPersonId: refPersonIdResult.value,
                  date: dateResult.value,
                  destinationService: r.destination_service,
                  reason: r.reason,
                  status: r.status,
                  requestingProfessionalId: profIdResult.value
              }, dateResult.value.toDate());
              if (refResult.isOk) referralsList.push(refResult.value);
          }
      }

      // 7. Reconstruir Violações
      const violationsList: RightsViolationReport[] = [];
      for (const v of violRows) {
          const vIdResult = Uuid.create(v.id);
          const victimIdResult = Uuid.create(v.victim_id);
          const repDateResult = Timestamp.create({ value: v.report_date });
          let incDate: Timestamp | undefined;
          if (v.incident_date) {
              const incResult = Timestamp.create({ value: v.incident_date });
              if (incResult.isOk) incDate = incResult.value;
          }
          if (vIdResult.isOk && victimIdResult.isOk && repDateResult.isOk) {
              const violResult = RightsViolationReport.create({
                  id: vIdResult.value,
                  victimId: victimIdResult.value,
                  reportDate: repDateResult.value,
                  incidentDate: incDate,
                  violationType: v.violation_type,
                  descriptionOfFact: v.description_of_fact,
                  actionsTaken: v.actions_taken || ""
              }, repDateResult.value.toDate());
              if (violResult.isOk) violationsList.push(violResult.value);
          }
      }

      // 8. Reconstrução final via Factory do Domínio
      const pIdResult = PersonId.create(row.person_id);
      if (pIdResult.isErr) return err(AppError.FailToCastPersonId());

      const patientIdResult = Uuid.create(row.id);
      if (patientIdResult.isErr) return err(AppError.RepositoryNotAvailable());

      let housingCondition: Option<HousingCondition> = None();
      if (row.housing_condition) {
          const hcResult = HousingCondition.create(row.housing_condition);
          if (hcResult.isOk) housingCondition = Some(hcResult.value);
      }

      let socioeconomicSituation: Option<SocioEconomicSituation> = None();
      if (row.socioeconomic_situation) {
          const sesResult = SocioEconomicSituation.create({
              ...row.socioeconomic_situation,
          });
          if (sesResult.isOk) socioeconomicSituation = Some(sesResult.value);
      }

      const patient = Patient.reconstitute(
          patientIdResult.value,
          {
            personId: pIdResult.value,
            diagnoses: ImutableListFactory.fromArray(diagnosesList),
            familyMembers: ImutableListFactory.fromArray(familyList),
            appointments: ImutableListFactory.fromArray(appointmentsList),
            referrals: ImutableListFactory.fromArray(referralsList),
            violationsReports: ImutableListFactory.fromArray(violationsList),
            housingCondition,
            socioeconomicSituation,
            communitySupportNetwork: None(),
            socialHealthSummary: None(),
          },
          0
      );

      return ok(patient);

    } catch (error) {
      console.error("Erro no findByPersonId:", error);
      return err(AppError.RepositoryNotAvailable());
    }
  }
}
