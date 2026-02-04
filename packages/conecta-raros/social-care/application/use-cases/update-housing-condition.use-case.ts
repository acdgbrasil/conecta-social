import { err, ok, type Result } from "@conecta/result";
import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { UpdateHousingConditionInput } from "@conecta/social-care/domain/inputs/UpdateHousingCondition.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol } from "@conecta/protocols";
import { PersonId } from "@conecta/social-care";
import { mapHousingConditionDtoToDomain } from "../mappers/social-assessment.mapper";

export class UpdateHousingConditionUseCase
  implements
    UseCaseProtocol<UpdateHousingConditionInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
  ) {}

  async execute(
    input: Readonly<UpdateHousingConditionInput>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(input.patientId);
    if (personIdResult.isErr) return err(personIdResult.error);

    const housingConditionResult = mapHousingConditionDtoToDomain(
      input.condition,
    );
    if (housingConditionResult.isErr) return err(housingConditionResult.error);

    const patientResult = await this.repository.findByPersonId(
      personIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const updateResult = patient.updateHousingCondition(
      housingConditionResult.value,
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
