import type { AddFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/add-family-member.command";
import { Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort } from "@conecta/ports";
import {
  FamilyMember,
  FamilyMemberId,
  P,
  Patient,
  PersonId,
} from "@conecta/social-care";
import { List, UseCasePipeline } from "@conecta/fn";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";

export type AddFamilyMemberDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeAddFamilyMemberUseCase = (deps: AddFamilyMemberDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<AddFamilyMemberCommand>) =>
      Result.combine({
        personId: PersonId.create(command.memberPersonId),
        patientPersonId: PersonId.create(command.patientId),
        familyMemberId: FamilyMemberId.create(command.memberPersonId),
        relationship: Result.ok(command.relationship),
        isResiding: Result.ok(command.isResiding),
        isCaregiver: Result.ok(command.isCaregiver),
      }),

    handle: async function* (ctx) {
      const patient = yield deps.repository.findByPersonId(ctx.patientPersonId);

      const existingMember = List.toArray(patient.props.familyMembers)
        .find((member) => PersonId.equals(member.personId, ctx.personId));
      
      if (existingMember)
        return Result.err(P.FamilyMemberAlreadyExists({ memberId: ctx.personId }));

      const newFamilyMember = yield FamilyMember.create({
        id: ctx.familyMemberId,
        personId: ctx.personId,
        relationship: ctx.relationship,
        isPrimaryCaregiver: ctx.isCaregiver,
        residesWithPatient: ctx.isResiding,
      });

      const updatedPatient = yield Patient.addFamilyMember(patient, newFamilyMember);

      return Result.ok({ aggregate: updatedPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });