import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { AssignPrimaryCaregiverInput } from "@conecta/social-care/domain/inputs/AssignPrimaryCaregiver.input";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort } from "@conecta/ports";
import { PersonId } from "@conecta/social-care";

export class AssignPrimaryCaregiverUseCase
  implements
    UseCasePort<AssignPrimaryCaregiverInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(
    input: Readonly<AssignPrimaryCaregiverInput>,
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

    const assignResult = patient.assignPrimaryCaregiver(
      memberPersonIdResult.value,
    );
    if (assignResult.isErr) return err(assignResult.error);

    const updatedPatient = assignResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }

    return ok(true);
  }
}
