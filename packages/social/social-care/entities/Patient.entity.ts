import type { DomainError } from "@conecta/domain-error";
import { err, ok, Result } from "@conecta/result";
import type { ImutableList } from "@conecta/fn";
import { ImutableListFactory } from "@conecta/fn";
import { None, Option, Some } from "@conecta/option";
import { Uuid } from "@conecta/uuid";

import { P } from "../err/Patient.error";
import type { Diagnosis } from "../value-objects/Diagnosis.valueObject";
import type { HousingCondition } from "../value-objects/housingCondition.valueObject";
import type { CommunitySupportNetwork } from "../value-objects/communitySupportNetwort.valueObject";
import type { SocialHealthSummary } from "../value-objects/socialHealthSummary.valueObject";
import type { SocioEconomicSituation } from "../value-objects/socioEconomicSituation.valueObject";
import { PersonId } from "../value-objects/personId.valueObject";
import { Timestamp } from "../value-objects/timestamp.valueObject";
import { FamilyMember } from "./FamilyMember.entity";
import { Referral, type ReferralProps } from "./Referral.entity";
import {
  RightsViolationReport,
  type RightsViolationReportProps,
} from "./RightsViolationReport.entity";
import {
  SocialCareAppointment,
  type SocialCareAppointmentProps,
} from "./SocialCareAppointment.entity";

type ReferralDraft = Partial<Omit<ReferralProps, "referredPersonId">> &
  Pick<ReferralProps, "referredPersonId">;

type ViolationDraft = Partial<
  Omit<RightsViolationReportProps, "victimId" | "violationType">
> &
  Pick<RightsViolationReportProps, "victimId" | "violationType">;

type AppointmentDraft = Partial<Omit<SocialCareAppointmentProps, "summary">> &
  Pick<SocialCareAppointmentProps, "summary">;

export type PatientProps = {
  readonly personId: PersonId;
  readonly diagnoses: ImutableList<Diagnosis>;
  readonly familyMembers: ImutableList<FamilyMember>;
  readonly appointments: ImutableList<SocialCareAppointment>;
  readonly referrals: ImutableList<Referral>;
  readonly violationsReports: ImutableList<RightsViolationReport>;
  readonly housingCondition: Option<HousingCondition>;
  readonly socioeconomicSituation: Option<SocioEconomicSituation>;
  readonly communitySupportNetwork: Option<CommunitySupportNetwork>;
  readonly socialHealthSummary: Option<SocialHealthSummary>;
};

export class Patient {
  private constructor(
    private readonly props: PatientProps,
    private readonly patientId: Uuid,
  ) { }

  get id(): Uuid {
    return this.patientId;
  }

  get personId(): PersonId {
    return this.props.personId;
  }

  get diagnoses(): ImutableList<Diagnosis> {
    return this.props.diagnoses;
  }

  get familyMembers(): ImutableList<FamilyMember> {
    return this.props.familyMembers;
  }

  get appointments(): ImutableList<SocialCareAppointment> {
    return this.props.appointments;
  }

  get referrals(): ImutableList<Referral> {
    return this.props.referrals;
  }

  get violationsReports(): ImutableList<RightsViolationReport> {
    return this.props.violationsReports;
  }

  get housingCondition(): Option<HousingCondition> {
    return this.props.housingCondition;
  }

  get socioeconomicSituation(): Option<SocioEconomicSituation> {
    return this.props.socioeconomicSituation;
  }

  get communitySupportNetwork(): Option<CommunitySupportNetwork> {
    return this.props.communitySupportNetwork;
  }

  get socialHealthSummary(): Option<SocialHealthSummary> {
    return this.props.socialHealthSummary;
  }

  static create( id: Uuid | null, personId: PersonId | null, diagnoses: ImutableList<Diagnosis> ): Result<Patient, DomainError> {
    
    if (!diagnoses || diagnoses.isEmpty()) return err(P.InitialDiagnosesCantBeEmpty());

    if (!id) return err(P.InitialIdIsRequired());

    if (!personId) return err(P.InitialPersonIdIsRequired());

    const initialProps: PatientProps = {
      personId,
      diagnoses,
      familyMembers: ImutableListFactory.empty<FamilyMember>(),
      appointments: ImutableListFactory.empty<SocialCareAppointment>(),
      referrals: ImutableListFactory.empty<Referral>(),
      violationsReports: ImutableListFactory.empty<RightsViolationReport>(),
      housingCondition: None<HousingCondition>(),
      socioeconomicSituation: None<SocioEconomicSituation>(),
      communitySupportNetwork: None<CommunitySupportNetwork>(),
      socialHealthSummary: None<SocialHealthSummary>(),
    };

    return ok(new Patient(initialProps, id));
  }

  copyWith(changes: Partial<PatientProps>): Patient {
    const merged: PatientProps = {
      personId: changes.personId ?? this.props.personId,
      diagnoses: changes.diagnoses ?? this.props.diagnoses,
      familyMembers: changes.familyMembers ?? this.props.familyMembers,
      appointments: changes.appointments ?? this.props.appointments,
      referrals: changes.referrals ?? this.props.referrals,
      violationsReports: changes.violationsReports ?? this.props.violationsReports,
      housingCondition: changes.housingCondition ?? this.props.housingCondition,
      socioeconomicSituation:
        changes.socioeconomicSituation ?? this.props.socioeconomicSituation,
      communitySupportNetwork:
        changes.communitySupportNetwork ?? this.props.communitySupportNetwork,
      socialHealthSummary:
        changes.socialHealthSummary ?? this.props.socialHealthSummary,
    };

    return new Patient(merged, this.patientId);
  }

  addFamilyMember(member: FamilyMember): Result<Patient, DomainError> {
    const exists = this.familyMembers
      .getAll()
      .some((current) => current.personId.equals(member.personId));

    if (exists) {
      return err(
        P.FamilyMemberAlreadyExists({
          memberId: member.personId.toString(),
        }),
      );
    }

    const updatedMembers = this.familyMembers.add(member);
    return ok(this.copyWith({ familyMembers: updatedMembers }));
  }

  removeFamilyMember(personId: PersonId): Result<Patient, DomainError> {
    const member = this.familyMembers
      .getAll()
      .find((candidate) => candidate.personId.equals(personId));

    if (!member) {
      return err(
        P.FamilyMemberNotFound({
          personId: personId.toString(),
        }),
      );
    }

    const updatedMembers = this.familyMembers.remove(member);
    return ok(this.copyWith({ familyMembers: updatedMembers }));
  }

  assignPrimaryCaregiver(personId: PersonId): Result<Patient, DomainError> {
    const members = this.familyMembers.getAll();
    const target = members.find((member) => member.personId.equals(personId));

    if (!target) {
      return err(
        P.FamilyMemberNotFound({
          personId: personId.toString(),
        }),
      );
    }

    if (target.isPrimaryCaregiver) {
      return ok(this);
    }

    const updatedMembers = members.map((member) =>
      member.personId.equals(personId)
        ? member.assignAsPrimaryCaregiver()
        : member.revokePrimaryCaregiver(),
    );

    return ok(
      this.copyWith({
        familyMembers: ImutableListFactory.fromArray(updatedMembers),
      }),
    );
  }

  createReferral(
    draft: ReferralDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    if (!this.belongsToBoundary(draft.referredPersonId)) {
      return err(
        P.ReferralTargetOutsideBoundary({
          targetId: draft.referredPersonId.toString(),
        }),
      );
    }

    const dateResult = this.ensureTimestamp(draft.date, referenceDate);
    if (dateResult.isErr) {
      return err(dateResult.unwrapErr());
    }
    const date = dateResult.unwrap();

    const referralResult = Referral.create(
      {
        id: draft.id ?? Uuid.create().unwrap(),
        date,
        requestingProfessionalId:
          draft.requestingProfessionalId ?? Uuid.create().unwrap(),
        referredPersonId: draft.referredPersonId,
        destinationService: draft.destinationService ?? "UNSPECIFIED",
        reason:
          draft.reason ??
          "Encaminhamento registrado a partir do agregado Patient.",
        status: draft.status,
      },
      referenceDate,
    );

    if (referralResult.isErr) {
      return err(referralResult.unwrapErr());
    }

    const referrals = ImutableListFactory.castTolist(this.referrals).add(
      referralResult.unwrap(),
    );
    return ok(this.copyWith({ referrals }));
  }

  reportRightsViolation(
    draft: ViolationDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    if (!this.belongsToBoundary(draft.victimId)) {
      return err(
        P.ViolationTargetOutsideBoundary({
          targetId: draft.victimId.toString(),
        }),
      );
    }

    const reportDateResult = this.ensureTimestamp(draft.reportDate, referenceDate);
    if (reportDateResult.isErr) {
      return err(reportDateResult.unwrapErr());
    }
    const reportDate = reportDateResult.unwrap();

    const incidentDateResult = this.ensureTimestamp(
      draft.incidentDate,
      reportDate.toDate(),
    );
    if (incidentDateResult.isErr) {
      return err(incidentDateResult.unwrapErr());
    }
    const incidentDate = incidentDateResult.unwrap();

    const violationResult = RightsViolationReport.create(
      {
        id: draft.id ?? Uuid.create().unwrap(),
        reportDate,
        incidentDate,
        victimId: draft.victimId,
        violationType: draft.violationType,
        descriptionOfFact:
          draft.descriptionOfFact ??
          "Relato registrado automaticamente pelo agregado Patient.",
        actionsTaken: draft.actionsTaken ?? "",
      },
      referenceDate,
    );

    if (violationResult.isErr) {
      return err(violationResult.unwrapErr());
    }

    const reports = ImutableListFactory.castTolist(
      this.violationsReports,
    ).add(violationResult.unwrap());
    return ok(this.copyWith({ violationsReports: reports }));
  }

  updateHousingCondition(
    condition: HousingCondition,
  ): Result<Patient, DomainError> {
    return ok(
      this.copyWith({
        housingCondition: Some(condition),
      }),
    );
  }

  registerAppointment(
    draft: AppointmentDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    const dateResult = this.ensureTimestamp(draft.date, referenceDate);
    if (dateResult.isErr) {
      return err(dateResult.unwrapErr());
    }
    const date = dateResult.unwrap();

    const appointmentResult = SocialCareAppointment.create(
      {
        id: draft.id ?? Uuid.create().unwrap(),
        date,
        professionalInChargeId:
          draft.professionalInChargeId ?? Uuid.create().unwrap(),
        type: draft.type ?? "FOLLOW_UP",
        summary: draft.summary,
        actionPlan: draft.actionPlan ?? "",
      },
      referenceDate,
    );

    if (appointmentResult.isErr) {
      return err(appointmentResult.unwrapErr());
    }

    const appointments = ImutableListFactory.castTolist(
      this.appointments,
    ).add(appointmentResult.unwrap());
    return ok(this.copyWith({ appointments }));
  }

  private belongsToBoundary(personUuid: Uuid): boolean {
    const candidate = personUuid.toString();
    if (this.personId.toString() === candidate) {
      return true;
    }

    return this.familyMembers
      .getAll()
      .some((member) => member.personId.toString() === candidate);
  }

  private ensureTimestamp(
    timestamp: Timestamp | undefined,
    referenceDate: Date,
  ): Result<Timestamp, DomainError> {
    if (timestamp) {
      return ok<Timestamp, DomainError>(timestamp);
    }

    return Timestamp.create({ value: referenceDate });
  }
}
