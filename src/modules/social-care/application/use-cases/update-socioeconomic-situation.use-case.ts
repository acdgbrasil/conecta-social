import { err, ok, type Result } from "@conecta/result";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, UseCasePort } from "@conecta/ports";
import { PersonId } from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";

export class UpdateSocioEconomicSituationUseCase
  implements
    UseCasePort<
      UpdateSocioEconomicSituationCommand,
      Result<boolean, DomainError>
    >
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(
    command: Readonly<UpdateSocioEconomicSituationCommand>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(command.patientId);
    if (personIdResult.isErr) return err(personIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      personIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const updateResult = patient.updateSocioEconomicSituation(
      command.situation,
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
