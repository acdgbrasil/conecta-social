import { err, ok, type Result } from "@conecta/result";
import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { CreateReferralInput } from "@conecta/social-care/domain/inputs/CreateReferral.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol, ClockProtocol } from "@conecta/protocols";
import { PersonId, type ReferralDraft, Timestamp } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

export class CreateReferralUseCase
  implements UseCaseProtocol<CreateReferralInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
    private readonly clock: ClockProtocol,
  ) {}

  async execute(
    input: Readonly<CreateReferralInput>,
  ): Promise<Result<boolean, DomainError>> {
    const patientPersonIdResult = PersonId.create(input.patientId);
    if (patientPersonIdResult.isErr) return err(patientPersonIdResult.error);

    const patientResult = await this.repository.findByPersonId(
      patientPersonIdResult.value,
    );
    if (patientResult.isErr) return err(patientResult.error);
    const patient = patientResult.value;

    const referredPersonIdResult = Uuid.create(input.referredPersonId);
    if (referredPersonIdResult.isErr) return err(referredPersonIdResult.error);

    let requestingProfessionalId: Uuid | undefined;
    if (input.professionalId) {
      const profIdResult = Uuid.create(input.professionalId);
      if (profIdResult.isErr) return err(profIdResult.error);
      requestingProfessionalId = profIdResult.value;
    }

    let date: Timestamp | undefined;
    if (input.date) {
      const tsResult = Timestamp.create({ value: input.date });
      if (tsResult.isErr) return err(tsResult.error);
      date = tsResult.value;
    }

    const draft: ReferralDraft = {
      referredPersonId: referredPersonIdResult.value,
      destinationService: input.destinationService,
      reason: input.reason,
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