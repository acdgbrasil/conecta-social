import { err, ok, type Result } from "@conecta/result";
import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { ReportRightsViolationInput } from "@conecta/social-care/domain/inputs/ReportRightsViolation.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol, ClockProtocol } from "@conecta/protocols";

export class ReportRightsViolationUseCase
  implements
    UseCaseProtocol<ReportRightsViolationInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
    private readonly clock: ClockProtocol,
  ) {}

  async execute(
    input: Readonly<ReportRightsViolationInput>,
  ): Promise<Result<boolean, DomainError>> {
    throw new Error("Not implemented");
  }
}
