import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import {
  Diagnosis,
  FamilyMember,
  FamilyMemberId,
  HousingCondition,
  ICDCode,
  Patient,
  PersonId,
  Referral,
  RightsViolationReport,
  SocialCareAppointment,
  SocioEconomicSituation,
  Timestamp,
} from "@conecta/social-care";
import { ImutableListFactory } from "@conecta/fn";
import { None, Option, Some, type Option as OptionType } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { AppError } from "../../../../application/errors/application.error";

export type PersistenceMappingIssue = {
  entity: string;
  recordId: string | null;
  field: string;
  reason: string;
  code?: string;
};

export type PatientPersistenceInsert = {
  id: string;
  person_id: string;
  housing_condition: any | null;
  socioeconomic_situation: any | null;
  community_support_network: any | null;
  social_health_summary: any | null;
};

export type PatientRow = PatientPersistenceInsert & {
  created_at: Date;
  updated_at: Date;
};

export type DiagnosisInsert = {
  patient_id: string;
  icd_code: string;
  diagnosis_date: Date;
  description: string | null;
};

export type DiagnosisRow = DiagnosisInsert & {
  id: string;
};

export type FamilyMemberRow = {
  id: string;
  patient_id: string;
  person_id: string;
  relationship: string;
  is_primary_caregiver: boolean;
  resides_with_patient: boolean;
};

export type SocialCareAppointmentRow = {
  id: string;
  patient_id: string;
  professional_in_charge_id: string;
  appointment_date: Date;
  summary: string;
  action_plan: string | null;
  appointment_type: string | null;
};

export type ReferralRow = {
  id: string;
  patient_id: string;
  referred_person_id: string;
  destination_service: string;
  reason: string;
  status: string | null;
  requesting_professional_id: string | null;
  referral_date: Date;
};

export type RightsViolationReportRow = {
  id: string;
  patient_id: string;
  victim_id: string;
  violation_type: string;
  description_of_fact: string;
  incident_date: Date | null;
  report_date: Date;
  actions_taken: string | null;
};

export type PatientPersistenceSnapshot = {
  patient: PatientPersistenceInsert;
  diagnoses: DiagnosisInsert[];
  familyMembers: FamilyMemberRow[];
  appointments: SocialCareAppointmentRow[];
  referrals: ReferralRow[];
  violations: RightsViolationReportRow[];
};

export type PatientPersistenceInput = {
  patient: PatientRow;
  diagnoses: DiagnosisRow[];
  familyMembers: FamilyMemberRow[];
  appointments: SocialCareAppointmentRow[];
  referrals: ReferralRow[];
  violations: RightsViolationReportRow[];
};

const resolveErrorReason = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
};

const resolveErrorCode = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
};

const pushIssue = (
  issues: PersistenceMappingIssue[],
  issue: PersistenceMappingIssue,
) => {
  issues.push(issue);
};

export const mapPatientToPersistence = (
  patient: Patient,
): PatientPersistenceSnapshot => {
  const patientId = patient.id.toString();

  return {
    patient: {
      id: patientId,
      person_id: patient.personId.toString(),
      housing_condition: Option.isSome(patient.housingCondition)
        ? Option.unwrap(patient.housingCondition)
        : null,
      socioeconomic_situation: Option.isSome(patient.socioeconomicSituation)
        ? Option.unwrap(patient.socioeconomicSituation)
        : null,
      community_support_network: Option.isSome(patient.communitySupportNetwork)
        ? Option.unwrap(patient.communitySupportNetwork)
        : null,
      social_health_summary: Option.isSome(patient.socialHealthSummary)
        ? Option.unwrap(patient.socialHealthSummary)
        : null,
    },
    diagnoses: ImutableListFactory.getAll(patient.diagnoses).map((diag) => ({
      patient_id: patientId,
      icd_code: diag.id.value,
      diagnosis_date: diag.date.toDate(),
      description: diag.description || null,
    })),
    familyMembers: ImutableListFactory.getAll(patient.familyMembers).map(
      (member) => ({
        id: member.id.toString(),
        patient_id: patientId,
        person_id: member.personId.toString(),
        relationship: member.relationship,
        is_primary_caregiver: member.isPrimaryCaregiver,
        resides_with_patient: member.residesWithPatient,
      }),
    ),
    appointments: ImutableListFactory.getAll(patient.appointments).map((app) => ({
      id: app.id.toString(),
      patient_id: patientId,
      professional_in_charge_id: app.professionalInChargeId.toString(),
      appointment_date: app.date.toDate(),
      summary: app.summary,
      action_plan: app.actionPlan,
      appointment_type: app.type,
    })),
    referrals: ImutableListFactory.getAll(patient.referrals).map((ref) => ({
      id: ref.id.toString(),
      patient_id: patientId,
      referred_person_id: ref.props.referredPersonId.toString(),
      destination_service: ref.destinationService,
      reason: ref.props.reason,
      status: ref.status,
      requesting_professional_id: ref.props.requestingProfessionalId.toString(),
      referral_date: ref.props.date.toDate(),
    })),
    violations: ImutableListFactory.getAll(patient.violationsReports).map((v) => ({
      id: v.id.toString(),
      patient_id: patientId,
      victim_id: v.props.victimId.toString(),
      violation_type: v.violationType,
      description_of_fact: v.props.descriptionOfFact,
      incident_date: v.props.incidentDate ? v.props.incidentDate.toDate() : null,
      report_date: v.props.reportDate.toDate(),
      actions_taken: v.actionsTaken,
    })),
  };
};

const mapDiagnosisRowsToDomain = (
  rows: DiagnosisRow[],
  issues: PersistenceMappingIssue[],
): Diagnosis[] => {
  const diagnosesList: Diagnosis[] = [];

  for (const row of rows) {
    const icdResult = ICDCode.create(row.icd_code);
    const dateResult = Timestamp.create({ value: row.diagnosis_date });
    if (icdResult.isErr) {
      pushIssue(issues, {
        entity: "Diagnosis",
        recordId: row.id,
        field: "icd_code",
        reason: resolveErrorReason(icdResult.error),
        code: resolveErrorCode(icdResult.error),
      });
      continue;
    }
    if (dateResult.isErr) {
      pushIssue(issues, {
        entity: "Diagnosis",
        recordId: row.id,
        field: "diagnosis_date",
        reason: resolveErrorReason(dateResult.error),
        code: resolveErrorCode(dateResult.error),
      });
      continue;
    }

    const diagResult = Diagnosis.create(
      {
        id: icdResult.value,
        date: dateResult.value,
        description: row.description || "",
      },
      dateResult.value,
    );
    if (diagResult.isOk) {
      diagnosesList.push(diagResult.value);
      continue;
    }

    pushIssue(issues, {
      entity: "Diagnosis",
      recordId: row.id,
      field: "description",
      reason: resolveErrorReason(diagResult.error),
      code: resolveErrorCode(diagResult.error),
    });
  }

  return diagnosesList;
};

const mapFamilyMemberRowsToDomain = (
  rows: FamilyMemberRow[],
  issues: PersistenceMappingIssue[],
): FamilyMember[] => {
  const familyList: FamilyMember[] = [];

  for (const row of rows) {
    const fIdResult = FamilyMemberId.create(row.id);
    const fPersonIdResult = PersonId.create(row.person_id);

    if (fIdResult.isErr) {
      pushIssue(issues, {
        entity: "FamilyMember",
        recordId: row.id,
        field: "id",
        reason: resolveErrorReason(fIdResult.error),
        code: resolveErrorCode(fIdResult.error),
      });
      continue;
    }

    if (fPersonIdResult.isErr) {
      pushIssue(issues, {
        entity: "FamilyMember",
        recordId: row.id,
        field: "person_id",
        reason: resolveErrorReason(fPersonIdResult.error),
        code: resolveErrorCode(fPersonIdResult.error),
      });
      continue;
    }

    const memberResult = FamilyMember.create({
      id: fIdResult.value,
      personId: fPersonIdResult.value,
      relationship: row.relationship,
      isPrimaryCaregiver: row.is_primary_caregiver,
      residesWithPatient: row.resides_with_patient,
    });

    if (memberResult.isOk) {
      familyList.push(memberResult.value);
      continue;
    }

    pushIssue(issues, {
      entity: "FamilyMember",
      recordId: row.id,
      field: "relationship",
      reason: resolveErrorReason(memberResult.error),
      code: resolveErrorCode(memberResult.error),
    });
  }

  return familyList;
};

const mapAppointmentRowsToDomain = (
  rows: SocialCareAppointmentRow[],
  issues: PersistenceMappingIssue[],
): SocialCareAppointment[] => {
  const appointmentsList: SocialCareAppointment[] = [];

  for (const row of rows) {
    const aIdResult = Uuid.create(row.id);
    const profIdResult = Uuid.create(row.professional_in_charge_id);
    const dateResult = Timestamp.create({ value: row.appointment_date });
    if (aIdResult.isErr) {
      pushIssue(issues, {
        entity: "SocialCareAppointment",
        recordId: row.id,
        field: "id",
        reason: resolveErrorReason(aIdResult.error),
        code: resolveErrorCode(aIdResult.error),
      });
      continue;
    }

    if (profIdResult.isErr) {
      pushIssue(issues, {
        entity: "SocialCareAppointment",
        recordId: row.id,
        field: "professional_in_charge_id",
        reason: resolveErrorReason(profIdResult.error),
        code: resolveErrorCode(profIdResult.error),
      });
      continue;
    }

    if (dateResult.isErr) {
      pushIssue(issues, {
        entity: "SocialCareAppointment",
        recordId: row.id,
        field: "appointment_date",
        reason: resolveErrorReason(dateResult.error),
        code: resolveErrorCode(dateResult.error),
      });
      continue;
    }

    const appResult = SocialCareAppointment.create(
      {
        id: aIdResult.value,
        professionalInChargeId: profIdResult.value,
        date: dateResult.value,
        summary: row.summary,
        actionPlan: row.action_plan ?? "",
        type: row.appointment_type ?? "",
      },
      dateResult.value.toDate(),
    );

    if (appResult.isOk) {
      appointmentsList.push(appResult.value);
      continue;
    }

    pushIssue(issues, {
      entity: "SocialCareAppointment",
      recordId: row.id,
      field: "summary",
      reason: resolveErrorReason(appResult.error),
      code: resolveErrorCode(appResult.error),
    });
  }

  return appointmentsList;
};

const mapReferralRowsToDomain = (
  rows: ReferralRow[],
  issues: PersistenceMappingIssue[],
): Referral[] => {
  const referralsList: Referral[] = [];

  for (const row of rows) {
    const rIdResult = Uuid.create(row.id);
    const refPersonIdResult = Uuid.create(row.referred_person_id);
    const dateResult = Timestamp.create({ value: row.referral_date });
    if (rIdResult.isErr) {
      pushIssue(issues, {
        entity: "Referral",
        recordId: row.id,
        field: "id",
        reason: resolveErrorReason(rIdResult.error),
        code: resolveErrorCode(rIdResult.error),
      });
      continue;
    }

    if (refPersonIdResult.isErr) {
      pushIssue(issues, {
        entity: "Referral",
        recordId: row.id,
        field: "referred_person_id",
        reason: resolveErrorReason(refPersonIdResult.error),
        code: resolveErrorCode(refPersonIdResult.error),
      });
      continue;
    }

    if (dateResult.isErr) {
      pushIssue(issues, {
        entity: "Referral",
        recordId: row.id,
        field: "referral_date",
        reason: resolveErrorReason(dateResult.error),
        code: resolveErrorCode(dateResult.error),
      });
      continue;
    }

    if (!row.requesting_professional_id) {
      pushIssue(issues, {
        entity: "Referral",
        recordId: row.id,
        field: "requesting_professional_id",
        reason: "Missing requesting_professional_id",
      });
      continue;
    }

    const profIdResult = Uuid.create(row.requesting_professional_id);
    if (profIdResult.isErr) {
      pushIssue(issues, {
        entity: "Referral",
        recordId: row.id,
        field: "requesting_professional_id",
        reason: resolveErrorReason(profIdResult.error),
        code: resolveErrorCode(profIdResult.error),
      });
      continue;
    }

    const refResult = Referral.create(
      {
        id: rIdResult.value,
        referredPersonId: refPersonIdResult.value,
        date: dateResult.value,
        destinationService: row.destination_service,
        reason: row.reason,
        status: row.status ?? undefined,
        requestingProfessionalId: profIdResult.value,
      },
      dateResult.value.toDate(),
    );

    if (refResult.isOk) {
      referralsList.push(refResult.value);
      continue;
    }

    pushIssue(issues, {
      entity: "Referral",
      recordId: row.id,
      field: "reason",
      reason: resolveErrorReason(refResult.error),
      code: resolveErrorCode(refResult.error),
    });
  }

  return referralsList;
};

const mapViolationRowsToDomain = (
  rows: RightsViolationReportRow[],
  issues: PersistenceMappingIssue[],
): RightsViolationReport[] => {
  const violationsList: RightsViolationReport[] = [];

  for (const row of rows) {
    const vIdResult = Uuid.create(row.id);
    const victimIdResult = Uuid.create(row.victim_id);
    const repDateResult = Timestamp.create({ value: row.report_date });
    let incDate: Timestamp | undefined;

    if (row.incident_date) {
      const incResult = Timestamp.create({ value: row.incident_date });
      if (incResult.isOk) {
        incDate = incResult.value;
      } else {
        pushIssue(issues, {
          entity: "RightsViolationReport",
          recordId: row.id,
          field: "incident_date",
          reason: resolveErrorReason(incResult.error),
          code: resolveErrorCode(incResult.error),
        });
        continue;
      }
    }

    if (vIdResult.isErr) {
      pushIssue(issues, {
        entity: "RightsViolationReport",
        recordId: row.id,
        field: "id",
        reason: resolveErrorReason(vIdResult.error),
        code: resolveErrorCode(vIdResult.error),
      });
      continue;
    }

    if (victimIdResult.isErr) {
      pushIssue(issues, {
        entity: "RightsViolationReport",
        recordId: row.id,
        field: "victim_id",
        reason: resolveErrorReason(victimIdResult.error),
        code: resolveErrorCode(victimIdResult.error),
      });
      continue;
    }

    if (repDateResult.isErr) {
      pushIssue(issues, {
        entity: "RightsViolationReport",
        recordId: row.id,
        field: "report_date",
        reason: resolveErrorReason(repDateResult.error),
        code: resolveErrorCode(repDateResult.error),
      });
      continue;
    }

    const violResult = RightsViolationReport.create(
      {
        id: vIdResult.value,
        victimId: victimIdResult.value,
        reportDate: repDateResult.value,
        incidentDate: incDate,
        violationType: row.violation_type,
        descriptionOfFact: row.description_of_fact,
        actionsTaken: row.actions_taken || "",
      },
      repDateResult.value.toDate(),
    );

    if (violResult.isOk) {
      violationsList.push(violResult.value);
      continue;
    }

    pushIssue(issues, {
      entity: "RightsViolationReport",
      recordId: row.id,
      field: "description_of_fact",
      reason: resolveErrorReason(violResult.error),
      code: resolveErrorCode(violResult.error),
    });
  }

  return violationsList;
};

const mapHousingConditionFromRow = (
  row: PatientRow,
  issues: PersistenceMappingIssue[],
): OptionType<HousingCondition> => {
  if (!row.housing_condition) return None();

  const hcResult = HousingCondition.create(row.housing_condition);
  if (hcResult.isErr) {
    pushIssue(issues, {
      entity: "Patient",
      recordId: row.id,
      field: "housing_condition",
      reason: resolveErrorReason(hcResult.error),
      code: resolveErrorCode(hcResult.error),
    });
    return None();
  }

  return Some(hcResult.value);
};

const mapSocioEconomicSituationFromRow = (
  row: PatientRow,
  issues: PersistenceMappingIssue[],
): OptionType<SocioEconomicSituation> => {
  if (!row.socioeconomic_situation) return None();

  const sesResult = SocioEconomicSituation.create({
    ...row.socioeconomic_situation,
  });
  if (sesResult.isErr) {
    pushIssue(issues, {
      entity: "Patient",
      recordId: row.id,
      field: "socioeconomic_situation",
      reason: resolveErrorReason(sesResult.error),
      code: resolveErrorCode(sesResult.error),
    });
    return None();
  }

  return Some(sesResult.value);
};

export const mapPatientPersistenceToDomain = (
  input: PatientPersistenceInput,
): Result<Patient, DomainError> => {
  const issues: PersistenceMappingIssue[] = [];

  const personIdResult = PersonId.create(input.patient.person_id);
  if (personIdResult.isErr) {
    pushIssue(issues, {
      entity: "Patient",
      recordId: input.patient.id,
      field: "person_id",
      reason: resolveErrorReason(personIdResult.error),
      code: resolveErrorCode(personIdResult.error),
    });
  }

  const patientIdResult = Uuid.create(input.patient.id);
  if (patientIdResult.isErr) {
    pushIssue(issues, {
      entity: "Patient",
      recordId: input.patient.id,
      field: "id",
      reason: resolveErrorReason(patientIdResult.error),
      code: resolveErrorCode(patientIdResult.error),
    });
  }

  const diagnoses = mapDiagnosisRowsToDomain(input.diagnoses, issues);
  const familyMembers = mapFamilyMemberRowsToDomain(
    input.familyMembers,
    issues,
  );
  const appointments = mapAppointmentRowsToDomain(
    input.appointments,
    issues,
  );
  const referrals = mapReferralRowsToDomain(input.referrals, issues);
  const violations = mapViolationRowsToDomain(input.violations, issues);

  const housingCondition = mapHousingConditionFromRow(input.patient, issues);
  const socioeconomicSituation = mapSocioEconomicSituationFromRow(
    input.patient,
    issues,
  );

  if (issues.length > 0 || personIdResult.isErr || patientIdResult.isErr) {
    return err(
      AppError.PersistenceMappingFailure(
        input.patient.id,
        issues,
        issues.length,
      ),
    );
  }

  const patient = Patient.reconstitute(
    patientIdResult.value,
    {
      personId: personIdResult.value,
      diagnoses: ImutableListFactory.fromArray(diagnoses),
      familyMembers: ImutableListFactory.fromArray(familyMembers),
      appointments: ImutableListFactory.fromArray(appointments),
      referrals: ImutableListFactory.fromArray(referrals),
      violationsReports: ImutableListFactory.fromArray(violations),
      housingCondition,
      socioeconomicSituation,
      communitySupportNetwork: None(),
      socialHealthSummary: None(),
    },
    0,
  );

  return ok(patient);
};
