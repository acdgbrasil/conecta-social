import { Result } from "@conecta/result";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort } from "@conecta/ports";
import { Patient, PersonId } from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { UseCasePipeline } from "@conecta/fn";

export type UpdateSocioEconomicSituationDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeUpdateSocioEconomicSituationUseCase = (deps: UpdateSocioEconomicSituationDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<UpdateSocioEconomicSituationCommand>) =>
      Result.combine({
        personId: PersonId.create(command.patientId),
        situation: Result.ok(command.situation),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.personId);

      const updatedPatient = yield Patient.updateSocioEconomicSituation(
        patient,
        ctx.situation,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });