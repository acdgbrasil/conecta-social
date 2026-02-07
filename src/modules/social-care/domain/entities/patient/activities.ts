import { List } from "@conecta/fn";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import type { DomainError } from "@conecta/domain-error";
import { 
  ReferralCreatedEvent, 
  RightsViolationReportedEvent, 
  SocialCareAppointmentRegisteredEvent 
} from "../../events";
import { P } from "../../errors/Patient.error";
import { Referral } from "../Referral.entity";
import { RightsViolationReport } from "../RightsViolationReport.entity";
import { SocialCareAppointment } from "../SocialCareAppointment.entity";
import type { Patient } from "./types";
import { copyWith } from "./core";
import type { ReferralDraft, ViolationDraft, AppointmentDraft } from "../..";
import { Timestamp } from "../../value-objects/timestamp.valueObject";

/**
 * Verifica se um ID pertence à fronteira do agregado (Paciente ou Família).
 */
export function belongsToBoundary(targetId: Uuid, patient: Patient): boolean {
  const candidate = targetId.toString();
  if (patient.props.personId.toString() === candidate) return true;
  return patient.props.familyMembers.some(m => m.personId.toString() === candidate);
}

export const PatientActivities = {
  createReferral(
    patient: Patient,
    draft: ReferralDraft,
    referenceDate: Date,
    newId: Uuid,
    professionalId: Uuid,
  ): Result<Patient, DomainError> {
    if (!belongsToBoundary(draft.referredPersonId, patient)) {
      return Result.err(P.ReferralTargetOutsideBoundary({ targetId: draft.referredPersonId.toString() }));
    }

    const date = draft.date ?? Result.unwrap(Timestamp.create({ value: referenceDate }));
    
    const referralResult = Referral.create({
        id: draft.id ?? newId,
        date,
        requestingProfessionalId: draft.requestingProfessionalId ?? professionalId,
        referredPersonId: draft.referredPersonId,
        destinationService: draft.destinationService ?? "UNSPECIFIED",
        reason: draft.reason ?? "Encaminhamento registrado a partir do agregado Patient.",
        status: draft.status,
      },
      referenceDate,
    );

    if (Result.isErr(referralResult)) return Result.err(referralResult.error);

    const event = ReferralCreatedEvent({
        patientId: patient.id.toString(),
        referralId: referralResult.value.id.toString(),
        referredPersonId: referralResult.value.referredPersonId.toString(),
        destinationService: referralResult.value.destinationService,
        status: referralResult.value.status,
        occurredAt: referenceDate,
    });

    const updated = copyWith(patient, { 
        referrals: List.add(patient.props.referrals, referralResult.value) 
    }, [event]);

    return Result.ok(updated);
  },

  reportRightsViolation(
    patient: Patient,
    draft: ViolationDraft,
    referenceDate: Date,
    newId: Uuid,
  ): Result<Patient, DomainError> {
    if (!belongsToBoundary(draft.victimId, patient)) {
      return Result.err(P.ViolationTargetOutsideBoundary({ targetId: draft.victimId.toString() }));
    }

    const reportDate = draft.reportDate ?? Result.unwrap(Timestamp.create({ value: referenceDate }));
    const incidentDate = draft.incidentDate ?? reportDate;

    const violationResult = RightsViolationReport.create({
        id: draft.id ?? newId,
        reportDate,
        incidentDate,
        victimId: draft.victimId,
        violationType: draft.violationType,
        descriptionOfFact: draft.descriptionOfFact ?? "Relato registrado automaticamente pelo agregado Patient.",
        actionsTaken: draft.actionsTaken ?? "",
      },
      referenceDate,
    );

    if (Result.isErr(violationResult)) return Result.err(violationResult.error);

    const event = RightsViolationReportedEvent({
        patientId: patient.id.toString(),
        reportId: violationResult.value.id.toString(),
        victimId: violationResult.value.victimId.toString(),
        violationType: violationResult.value.violationType,
        occurredAt: referenceDate,
    });

    return Result.ok(copyWith(patient, { 
        violationsReports: List.add(patient.props.violationsReports, violationResult.value) 
    }, [event]));
  },

  registerAppointment(
    patient: Patient,
    draft: AppointmentDraft,
    referenceDate: Date,
    newId: Uuid,
    professionalId: Uuid,
  ): Result<Patient, DomainError> {
    const date = draft.date ?? Result.unwrap(Timestamp.create({ value: referenceDate }));

    const appointmentResult = SocialCareAppointment.create({
        id: draft.id ?? newId,
        date,
        professionalInChargeId: draft.professionalInChargeId ?? professionalId,
        type: draft.type ?? "FOLLOW_UP",
        summary: draft.summary,
        actionPlan: draft.actionPlan ?? "",
      },
      referenceDate,
    );

    if (Result.isErr(appointmentResult)) return Result.err(appointmentResult.error);

    const event = SocialCareAppointmentRegisteredEvent({
        patientId: patient.id.toString(),
        appointmentId: appointmentResult.value.id.toString(),
        professionalInChargeId: appointmentResult.value.professionalInChargeId.toString(),
        type: appointmentResult.value.type,
        occurredAt: referenceDate,
    });

    return Result.ok(copyWith(patient, { 
        appointments: List.add(patient.props.appointments, appointmentResult.value) 
    }, [event]));
  }
} as const;