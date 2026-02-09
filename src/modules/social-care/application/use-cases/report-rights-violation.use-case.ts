import { Result } from "@conecta/result";
import { UseCasePipeline } from "@conecta/fn";
import type { ReportRightsViolationCommand } from "@conecta/social-care/application/ports/commands/report-rights-violation.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { EventBusPort, ClockPort } from "@conecta/ports";
import { Patient, PersonId, Timestamp, ViolationType } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

export type ReportRightsViolationDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
  readonly clock: ClockPort;
};

export const makeReportRightsViolationUseCase = (deps: ReportRightsViolationDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<ReportRightsViolationCommand>) =>
      Result.combine({
        patientPersonId: PersonId.create(command.patientId),
        victimId: Uuid.create(command.victimId),
        reportDate: command.reportDate
          ? Timestamp.create({ value: command.reportDate })
          : Result.ok(undefined),
        incidentDate: command.incidentDate
          ? Timestamp.create({ value: command.incidentDate })
          : Result.ok(undefined),
        violationType: Result.ok(command.violationType),
        descriptionOfFact: Result.ok(command.descriptionOfFact),
        actionsTaken: Result.ok(command.actionsTaken ?? ""),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.patientPersonId);

      const updatedPatient = yield Patient.reportRightsViolation(
        patient,
        {
          victimId: ctx.victimId,
          violationType: ctx.violationType as (typeof ViolationType)[keyof typeof ViolationType],
          descriptionOfFact: ctx.descriptionOfFact,
          reportDate: ctx.reportDate,
          incidentDate: ctx.incidentDate,
          actionsTaken: ctx.actionsTaken,
        },
        deps.clock.now(),
        Uuid.v7().uuid,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });
