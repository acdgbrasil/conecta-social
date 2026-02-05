import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { ReportRightsViolationInput } from "@conecta/social-care/domain/inputs/ReportRightsViolation.input";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";

export class ReportRightsViolationUseCase
  implements
    UseCasePort<ReportRightsViolationInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    input: Readonly<ReportRightsViolationInput>,
  ): Promise<Result<boolean, DomainError>> {
    throw new Error("Not implemented");
  }
}
