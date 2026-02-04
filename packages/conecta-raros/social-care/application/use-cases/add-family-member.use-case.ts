import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { AddFamilyMemberInput } from "@conecta/social-care/domain/inputs/AddFamilyMember.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol } from "@conecta/protocols";
import {
  FamilyMember,
  FamilyMemberId,
  P,
  PersonId,
} from "@conecta/social-care";

export class AddFamilyMemberUseCase
  implements
    UseCaseProtocol<AddFamilyMemberInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
  ) {}

  async execute(
    input: Readonly<AddFamilyMemberInput>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(input.memberPersonId);
    if (personIdResult.isErr) return err(personIdResult.error);
    const personId = personIdResult.value;

    const patientPersonIdResult = PersonId.create(input.patientId);
    if (patientPersonIdResult.isErr) return err(patientPersonIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      patientPersonIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const familyMemberIdResult = FamilyMemberId.create(input.memberPersonId);
    if (familyMemberIdResult.isErr) return err(familyMemberIdResult.error);

    const existingMember = patient.familyMembers
      .getAll()
      .find((member) => member.personId.equals(personId));
    if (existingMember)
      return err(P.FamilyMemberAlreadyExists({ memberId: input.memberPersonId }));

    const newFamilyMemberResult = FamilyMember.create({
      id: familyMemberIdResult.value,
      personId: personId,
      relationship: input.relationship,
      isPrimaryCaregiver: input.isCaregiver,
      residesWithPatient: input.isResiding,
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