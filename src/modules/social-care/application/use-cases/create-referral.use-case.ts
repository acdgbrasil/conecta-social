import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { CreateReferralCommand } from "@conecta/social-care/application/ports/commands/create-referral.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";
import { PersonId, type ReferralDraft, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

export class CreateReferralUseCase
  implements UseCasePort<CreateReferralCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    command: Readonly<CreateReferralCommand>,
  ): Promise<Result<boolean, DomainError>> {
    const patientPersonIdResult = PersonId.create(command.patientId);
    if (patientPersonIdResult.isErr) return err(patientPersonIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      patientPersonIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const referredPersonIdResult = Uuid.create(command.referredPersonId);
    if (referredPersonIdResult.isErr) return err(referredPersonIdResult.error);

    let requestingProfessionalId: Uuid | undefined;
    if (command.professionalId) {
      const profIdResult = Uuid.create(command.professionalId);
      if (profIdResult.isErr) return err(profIdResult.error);
      requestingProfessionalId = profIdResult.value;
    }

    let date: Timestamp | undefined;
    if (command.date) {
      const tsResult = Timestamp.create({ value: command.date });
      if (tsResult.isErr) return err(tsResult.error);
      date = tsResult.value;
    }

    const draft: ReferralDraft = {
      referredPersonId: referredPersonIdResult.value,
      destinationService: command.destinationService,
      reason: command.reason,
      requestingProfessionalId,
      date,
    };

    const referralResult = patient.createReferral(
      draft,
      this.clock.now(),
    );

    if (referralResult.isErr) return err(referralResult.error);
    const updatedPatient = referralResult.value;

    const saveResult = await this.repository.save(updatedPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = updatedPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }

    return ok(true);
  }
}
