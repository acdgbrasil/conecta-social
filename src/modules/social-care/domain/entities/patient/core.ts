import { systemClock, uuidV7Provider } from "@conecta/adapters";
import type { DomainError } from "@conecta/domain-error/DomainError";
import { List } from "@conecta/fn";
import { Option } from "@conecta/option";
import type { ClockPort, DomainEvent, IdProviderPort } from "@conecta/ports";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";
import { Aggregate } from "@conecta/shared/aggregate-root/aggregate";
import { PatientCreatedEvent } from "../../events";
import { P } from "../../errors/Patient.error";
import type { Diagnosis, PersonId } from "../../value-objects";
import type { Patient, PatientProps } from "./types";

export type PatientDependencies = {
  idProvider?: IdProviderPort;
  clock?: ClockPort;
};

const defaultDependencies: Required<PatientDependencies> = {
  idProvider: uuidV7Provider,
  clock: systemClock,
};

export function resolveDeps(deps: PatientDependencies): Required<PatientDependencies> {
  return {
    idProvider: deps.idProvider ?? defaultDependencies.idProvider,
    clock: deps.clock ?? defaultDependencies.clock,
  };
}

/**
 * Helper interno para gerar uma nova versão do agregado com novos eventos.
 */
export function copyWith(
  patient: Patient,
  changes: Partial<PatientProps>,
  newEvents: DomainEvent[] = []
): Patient {
  const updated = Aggregate.update(patient, changes);
  return {
    ...updated,
    version: patient.version + 1,
    events: [...patient.events, ...newEvents],
  };
}

export const PatientCore = {
  createFromScratch(
    personId: PersonId,
    diagnoses: readonly Diagnosis[],
    deps: PatientDependencies = {},
  ): Result<Patient, DomainError> {
    const resolvedDeps = resolveDeps(deps);
    const patientIdResult = Uuid.create(resolvedDeps.idProvider.generate());
    if (Result.isErr(patientIdResult)) return Result.err(P.InitialIdIsRequired());
    const patientId = patientIdResult.value;
    
    if (!personId) return Result.err(P.InitialPersonIdIsRequired());
    if (!diagnoses || List.isEmpty(diagnoses)) return Result.err(P.InitialDiagnosesCantBeEmpty());

    const initialProps: PatientProps = {
      personId,
      diagnoses: List.from(diagnoses),
      familyMembers: List.empty(),
      appointments: List.empty(),
      referrals: List.empty(),
      violationsReports: List.empty(),
      housingCondition: Option.none(),
      socioeconomicSituation: Option.none(),
      communitySupportNetwork: Option.none(),
      socialHealthSummary: Option.none(),
    };

    const patient = Aggregate.of(patientId, initialProps);

    const createdEvent = PatientCreatedEvent({
      patientId: patientId.toString(),
      personId: personId.toString(),
      occurredAt: resolvedDeps.clock.now(),
    });

    return Result.ok(Aggregate.addEvent(patient, createdEvent));
  },

  reconstitute(id: Uuid, props: PatientProps, version = 0): Patient {
    return Aggregate.of(id, props, version);
  },

  pullDomainEvents(patient: Patient): {
    events: readonly DomainEvent[];
    aggregate: Patient;
    patient: Patient;
  } {
    const cleared = Aggregate.clearEvents(patient);
    return {
      events: patient.events,
      aggregate: cleared,
      patient: cleared,
    };
  }
} as const;
