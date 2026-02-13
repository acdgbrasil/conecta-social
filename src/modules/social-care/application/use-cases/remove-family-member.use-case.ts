import { Result } from "@conecta/result";
import type { RemoveFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/remove-family-member.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import type { DomainError } from "@conecta/domain-error/DomainError";
import type { EventBusPort } from "@conecta/ports";
import { Patient, PersonId } from "@conecta/social-care";
import { UseCasePipeline } from "@conecta/fn";

export type RemoveFamilyMemberDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeRemoveFamilyMemberUseCase = (deps: RemoveFamilyMemberDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<RemoveFamilyMemberCommand>) =>
      Result.combine({
        patientPersonId: PersonId.create(command.patientId),
        memberPersonId: PersonId.create(command.memberPersonId),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.patientPersonId);

      const updatedPatient = yield Patient.removeFamilyMember(
        patient,
        ctx.memberPersonId,
      );

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
  });