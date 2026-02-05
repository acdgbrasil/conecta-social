import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { RemoveFamilyMemberInput } from "@conecta/social-care/domain/inputs/RemoveFamilyMember.input";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort } from "@conecta/ports";
import { PersonId } from "@conecta/social-care";

export class RemoveFamilyMemberUseCase
  implements
    UseCasePort<RemoveFamilyMemberInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(
    input: Readonly<RemoveFamilyMemberInput>,
  ): Promise<Result<boolean, DomainError>> {
    const patientPersonIdResult = PersonId.create(input.patientId);
    if (patientPersonIdResult.isErr) return err(patientPersonIdResult.error);

    const memberPersonIdResult = PersonId.create(input.memberPersonId);
    if (memberPersonIdResult.isErr) return err(memberPersonIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      patientPersonIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const removeResult = patient.removeFamilyMember(memberPersonIdResult.value);
    if (removeResult.isErr) return err(removeResult.error);

    const updatedPatient = removeResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) this.eventBus.publish(events);
    return ok(true);
  }
}
