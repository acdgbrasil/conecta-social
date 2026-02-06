import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { RegisterAppointmentCommand } from "@conecta/social-care/application/ports/commands/register-appointment.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";
import { PersonId, type AppointmentDraft, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

export class RegisterAppointmentUseCase
  implements
    UseCasePort<RegisterAppointmentCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    command: Readonly<RegisterAppointmentCommand>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(command.patientId);
    if (personIdResult.isErr) return err(personIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      personIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    let timestamp: Timestamp | undefined;
    if (command.date) {
      const tsResult = Timestamp.create({ value: command.date });
      if (tsResult.isErr) return err(tsResult.error);
      timestamp = tsResult.value;
    }

    const professionalIdResult = Uuid.create(command.professionalId);
    if (professionalIdResult.isErr) return err(professionalIdResult.error);

    const draft: AppointmentDraft = {
      summary: command.summary,
      actionPlan: command.actionPlan,
      type: command.type,
      date: timestamp,
      professionalInChargeId: professionalIdResult.value,
    };

    const registerResult = patient.registerAppointment(
      draft,
      this.clock.now(),
    );
    if (registerResult.isErr) return err(registerResult.error);

    const updatedPatient = registerResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }

    return ok(true);
  }
}
