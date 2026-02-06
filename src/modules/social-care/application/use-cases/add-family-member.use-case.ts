import type { AddFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/add-family-member.command";
import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, UseCasePort } from "@conecta/ports";
import {
  FamilyMember,
  FamilyMemberId,
  P,
  PersonId,
} from "@conecta/social-care";
import { ImutableListFactory } from "@conecta/fn";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";

export class AddFamilyMemberUseCase
  implements
    UseCasePort<AddFamilyMemberCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(
    command: Readonly<AddFamilyMemberCommand>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(command.memberPersonId);
    if (personIdResult.isErr) return err(personIdResult.error);
    const personId = personIdResult.value;

    const patientPersonIdResult = PersonId.create(command.patientId);
    if (patientPersonIdResult.isErr) return err(patientPersonIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      patientPersonIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const familyMemberIdResult = FamilyMemberId.create(command.memberPersonId);
    if (familyMemberIdResult.isErr) return err(familyMemberIdResult.error);

    const existingMember = ImutableListFactory.getAll(patient.familyMembers)
      .find((member) => member.personId.equals(personId));
    if (existingMember)
      return err(
        P.FamilyMemberAlreadyExists({ memberId: command.memberPersonId }),
      );

    const newFamilyMemberResult = FamilyMember.create({
      id: familyMemberIdResult.value,
      personId: personId,
      relationship: command.relationship,
      isPrimaryCaregiver: command.isCaregiver,
      residesWithPatient: command.isResiding,
    });

    if (newFamilyMemberResult.isErr) return err(newFamilyMemberResult.error);
    const newFamilyMember = newFamilyMemberResult.value;

    const newPatientResult = patient.addFamilyMember(newFamilyMember);
    if (newPatientResult.isErr) return err(newPatientResult.error);
    const updatedPatient = newPatientResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }
    
    return ok(true);
  }
}
