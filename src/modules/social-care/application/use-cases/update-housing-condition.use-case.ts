import { err, ok, type Result } from "@conecta/result";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, UseCasePort } from "@conecta/ports";
import { PersonId } from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";

export class UpdateHousingConditionUseCase
  implements
    UseCasePort<UpdateHousingConditionCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(
    command: Readonly<UpdateHousingConditionCommand>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(command.patientId);
    if (personIdResult.isErr) return err(personIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      personIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const updateResult = patient.updateHousingCondition(
      command.condition,
    );
    if (updateResult.isErr) return err(updateResult.error);

    const updatedPatient = updateResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    // Publicar eventos (se houver, embora updateHousingCondition não gere eventos explícitos no momento)
    // Mantendo o padrão para consistência futura.
    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }

    return ok(true);
  }
}
