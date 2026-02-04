// biome-ignore assist/source/organizeImports: <Dps colocar uma explicação quando for ultilizar esse recurso>
import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import { ImutableListFactory, type ImutableList } from "@conecta/fn";
import { None, Some, type Option } from "@conecta/option";
import { Uuid } from "@conecta/uuid";
import { systemClock, uuidV7Provider } from "@conecta/adapters";
import type {
  ClockProtocol,
  DomainEvent,
  IdProviderProtocol,
} from "@conecta/protocols";
import {
  FamilyMemberAddedEvent,
  PatientCreatedEvent,
  P,
  Referral,
  ReferralCreatedEvent,
  RightsViolationReport,
  RightsViolationReportedEvent,
  SocialCareAppointment,
  SocialCareAppointmentRegisteredEvent,
  type AppointmentDraft,
  type CommunitySupportNetwork,
  type Diagnosis,
  type FamilyMember,
  type HousingCondition,
  type PersonId,
  type ReferralDraft,
  type SocialHealthSummary,
  type SocioEconomicSituation,
  type ViolationDraft,
} from "@conecta/social-care";
import { AggregateRoot } from "@conecta/shared/aggregate-root/AggregateRoot";
import {
  ensureFamilyMemberNotExists,
  findFamilyMemberByPersonId,
  updatePrimaryCaregiverMembers,
} from "../services/addFamilyMember.service";
import { belongsToBoundary } from "../services/patient-boundary.service";
import { ensureTimestamp } from "../services/patient-timestamp.service";


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

type PatientDependencies = {
  idProvider?: IdProviderProtocol;
  clock?: ClockProtocol;
};

const defaultDependencies: Required<PatientDependencies> = {
  idProvider: uuidV7Provider,
  clock: systemClock,
};


export class Patient extends AggregateRoot<PatientProps> {
  private constructor(
    props: PatientProps,
    private readonly patientId: Uuid,
    private readonly deps: Required<PatientDependencies>,
    version: number = 0,
    domainEvents: DomainEvent[] = [],
  ) {
    super(patientId, props, version, domainEvents);
  }

  static createFromScratch(
    personId: PersonId,
    diagnoses: ImutableList<Diagnosis>,
    deps: PatientDependencies = {},
  ): Result<Patient, DomainError> {
    const resolvedDeps = Patient.resolveDeps(deps);
    const patientId = Uuid.create(resolvedDeps.idProvider.generate());
    if (!personId) return err(P.InitialPersonIdIsRequired());
    if (!diagnoses) return err(P.InitialDiagnosesCantBeEmpty());
    if (diagnoses.isEmpty()) return err(P.InitialDiagnosesCantBeEmpty());
    if (diagnoses.hasDuplicates())
      return err(P.InitialDiagnosesCantHaveDuplicates());

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
    const domainEvents: DomainEvent[] = [
      PatientCreatedEvent({
        patientId: patientId.unwrap().toString(),
        personId: personId.toString(),
        occurredAt: resolvedDeps.clock.now(),
      }),
    ];

    return ok(
      new Patient(
        initialProps,
        patientId.unwrap(),
        resolvedDeps,
        0,
        domainEvents,
      ),
    );
  }

  static createFromObject(
    id: Uuid,
    props: PatientProps,
    deps: PatientDependencies = {},
  ): Result<Patient, DomainError> {
    if (!id) return err(P.InitialIdIsRequired());
    if (!props.personId) return err(P.InitialPersonIdIsRequired());

    return ok(new Patient(props, id, Patient.resolveDeps(deps)));
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

  copyWith(
    changes: Partial<PatientProps>,
    version?: number,
    domainEvents?: DomainEvent[],
  ): Patient {
    const merged: PatientProps = {
      personId: changes.personId ?? this.props.personId,
      diagnoses: changes.diagnoses ?? this.props.diagnoses,
      familyMembers: changes.familyMembers ?? this.props.familyMembers,
      appointments: changes.appointments ?? this.props.appointments,
      referrals: changes.referrals ?? this.props.referrals,
      violationsReports:
        changes.violationsReports ?? this.props.violationsReports,
      housingCondition: changes.housingCondition ?? this.props.housingCondition,
      socioeconomicSituation:
        changes.socioeconomicSituation ?? this.props.socioeconomicSituation,
      communitySupportNetwork:
        changes.communitySupportNetwork ?? this.props.communitySupportNetwork,
      socialHealthSummary:
        changes.socialHealthSummary ?? this.props.socialHealthSummary,
    };

    return new Patient(
      merged,
      this.patientId,
      this.deps,
      version ?? this.version,
      [...this.domainEvents, ...(domainEvents ?? [])],
    );
  }

  addFamilyMember(member: FamilyMember): Result<Patient, DomainError> {
    const existsResult = ensureFamilyMemberNotExists(
      member,
      this.familyMembers,
    );
    if (existsResult.isErr) {
      return err(existsResult.error);
    }

    const updatedMembers = this.familyMembers.add(member);
    const domainEvents: DomainEvent[] = [
      FamilyMemberAddedEvent({
        memberId: member.personId.toString(),
        patientId: this.patientId.toString(),
        relationship: member.relationship,
        occurredAt: this.deps.clock.now(),
      }),
    ];
    return ok(
      this.copyWith({ familyMembers: updatedMembers }, this.version + 1, [
        ...domainEvents,
      ]),
    );
  }

  removeFamilyMember(personId: PersonId): Result<Patient, DomainError> {
    const memberResult = findFamilyMemberByPersonId(
      personId,
      this.familyMembers,
    );
    if (memberResult.isErr) {
      return err(memberResult.error);
    }
    const member = memberResult.value;

    const updatedMembers = this.familyMembers.remove(member);
    return ok(this.copyWith({ familyMembers: updatedMembers }));
  }

  assignPrimaryCaregiver(personId: PersonId): Result<Patient, DomainError> {
    const updateResult = updatePrimaryCaregiverMembers(
      personId,
      this.familyMembers,
    );
    if (updateResult.isErr) {
      return err(updateResult.error);
    }

    const { members, isNoop } = updateResult.value;
    if (isNoop) {
      return ok(this);
    }

    return ok(this.copyWith({ familyMembers: members }));
  }

  createReferral(
    draft: ReferralDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    if (
      !belongsToBoundary(
        draft.referredPersonId,
        this.personId,
        this.familyMembers,
      )
    ) {
      return err(
        P.ReferralTargetOutsideBoundary({
          targetId: draft.referredPersonId.toString(),
        }),
      );
    }

    const dateResult = ensureTimestamp(draft.date, referenceDate);
    if (dateResult.isErr) {
      return err(dateResult.error);
    }
    const date = dateResult.value;

    const referralResult = Referral.create(
      {
        id: draft.id ?? this.generateUuid(),
        date,
        requestingProfessionalId:
          draft.requestingProfessionalId ?? this.generateUuid(),
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
      return err(referralResult.error);
    }

    const referral = referralResult.value;
    const referrals = ImutableListFactory.castTolist(this.referrals).add(
      referral,
    );
    const domainEvents: DomainEvent[] = [
      ReferralCreatedEvent({
        patientId: this.patientId.toString(),
        referralId: referral.id.toString(),
        referredPersonId: referral.props.referredPersonId.toString(),
        destinationService: referral.destinationService,
        status: referral.status,
        occurredAt: this.deps.clock.now(),
      }),
    ];
    return ok(this.copyWith({ referrals }, this.version + 1, domainEvents));
  }

  reportRightsViolation(
    draft: ViolationDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    if (
      !belongsToBoundary(
        draft.victimId,
        this.personId,
        this.familyMembers,
      )
    ) {
      return err(
        P.ViolationTargetOutsideBoundary({
          targetId: draft.victimId.toString(),
        }),
      );
    }

    const reportDateResult = ensureTimestamp(
      draft.reportDate,
      referenceDate,
    );
    if (reportDateResult.isErr) {
      return err(reportDateResult.error);
    }
    const reportDate = reportDateResult.value;

    const incidentDateResult = ensureTimestamp(
      draft.incidentDate,
      reportDate.toDate(),
    );
    if (incidentDateResult.isErr) {
      return err(incidentDateResult.error);
    }
    const incidentDate = incidentDateResult.value;

    const violationResult = RightsViolationReport.create(
      {
        id: draft.id ?? this.generateUuid(),
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
      return err(violationResult.error);
    }

    const report = violationResult.value;
    const reports = ImutableListFactory.castTolist(this.violationsReports).add(
      report,
    );
    const domainEvents: DomainEvent[] = [
      RightsViolationReportedEvent({
        patientId: this.patientId.toString(),
        reportId: report.id.toString(),
        victimId: report.props.victimId.toString(),
        violationType: report.violationType,
        occurredAt: this.deps.clock.now(),
      }),
    ];
    return ok(
      this.copyWith(
        { violationsReports: reports },
        this.version + 1,
        domainEvents,
      ),
    );
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

  updateSocioEconomicSituation(
    situation: SocioEconomicSituation,
  ): Result<Patient, DomainError> {
    return ok(
      this.copyWith({
        socioeconomicSituation: Some(situation),
      }),
    );
  }

  registerAppointment(
    draft: AppointmentDraft,
    referenceDate: Date,
  ): Result<Patient, DomainError> {
    const dateResult = ensureTimestamp(draft.date, referenceDate);
    if (dateResult.isErr) {
      return err(dateResult.error);
    }
    const date = dateResult.value;

    const appointmentResult = SocialCareAppointment.create(
      {
        id: draft.id ?? this.generateUuid(),
        date,
        professionalInChargeId:
          draft.professionalInChargeId ?? this.generateUuid(),
        type: draft.type ?? "FOLLOW_UP",
        summary: draft.summary,
        actionPlan: draft.actionPlan ?? "",
      },
      referenceDate,
    );

    if (appointmentResult.isErr) {
      return err(appointmentResult.error);
    }

    const appointment = appointmentResult.value;
    const appointments = ImutableListFactory.castTolist(this.appointments).add(
      appointment,
    );
    const domainEvents: DomainEvent[] = [
      SocialCareAppointmentRegisteredEvent({
        patientId: this.patientId.toString(),
        appointmentId: appointment.id.toString(),
        professionalInChargeId:
          appointment.professionalInChargeId.toString(),
        type: appointment.type,
        occurredAt: this.deps.clock.now(),
      }),
    ];
    return ok(
      this.copyWith({ appointments }, this.version + 1, domainEvents),
    );
  }

  private generateUuid(): Uuid {
    return Uuid.create(this.deps.idProvider.generate()).unwrap();
  }

  private static resolveDeps(
    deps: PatientDependencies,
  ): Required<PatientDependencies> {
    return {
      idProvider: deps.idProvider ?? defaultDependencies.idProvider,
      clock: deps.clock ?? defaultDependencies.clock,
    };
  }

}
