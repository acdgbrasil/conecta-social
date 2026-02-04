import { err, ok, type Result } from "@conecta/result";
import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { UpdateSocioEconomicSituationInput } from "@conecta/social-care/domain/inputs/UpdateSocioEconomicSituation.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol } from "@conecta/protocols";
import { PersonId } from "@conecta/social-care";
import { mapSocioEconomicSituationDtoToDomain } from "../mappers/social-assessment.mapper";

export class UpdateSocioEconomicSituationUseCase
  implements
    UseCaseProtocol<
      UpdateSocioEconomicSituationInput,
      Result<boolean, DomainError>
    >
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
  ) {}

  async execute(
    input: Readonly<UpdateSocioEconomicSituationInput>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(input.patientId);
    if (personIdResult.isErr) return err(personIdResult.error);

    const situationResult = mapSocioEconomicSituationDtoToDomain(
      input.situation,
    );
    if (situationResult.isErr) return err(situationResult.error);

    const patientResult = await this.repository.findByPersonId(
      personIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const updateResult = patient.updateSocioEconomicSituation(
      situationResult.value,
    );
    if (updateResult.isErr) return err(updateResult.error);

    const updatedPatient = updateResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }

    return ok(true);
  }
}
