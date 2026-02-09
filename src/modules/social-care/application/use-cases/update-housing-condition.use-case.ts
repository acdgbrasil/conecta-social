import { Result } from "@conecta/result";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { EventBusPort } from "@conecta/ports";
import { Patient, PersonId } from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import { UseCasePipeline } from "@conecta/fn";

export type UpdateHousingConditionDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeUpdateHousingConditionUseCase = (deps: UpdateHousingConditionDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<UpdateHousingConditionCommand>) =>
      Result.combine({
        personId: PersonId.create(command.patientId),
        condition: Result.ok(command.condition),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.personId);

      const updatedPatient = yield Patient.updateHousingCondition(
        patient,
        ctx.condition,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });