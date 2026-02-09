import { Result } from "@conecta/result";
import type { AssignPrimaryCaregiverCommand } from "@conecta/social-care/application/ports/commands/assign-primary-caregiver.command";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { EventBusPort } from "@conecta/ports";
import { Patient, PersonId } from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import { UseCasePipeline } from "@conecta/fn";

export type AssignPrimaryCaregiverDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeAssignPrimaryCaregiverUseCase = (deps: AssignPrimaryCaregiverDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<AssignPrimaryCaregiverCommand>) =>
      Result.combine({
        patientPersonId: PersonId.create(command.patientId),
        memberPersonId: PersonId.create(command.memberPersonId),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.patientPersonId);

      const updatedPatient = yield Patient.assignPrimaryCaregiver(
        patient,
        ctx.memberPersonId,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });