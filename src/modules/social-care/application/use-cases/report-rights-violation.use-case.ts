import { err, ok, type Result } from "@conecta/result";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { ReportRightsViolationCommand } from "@conecta/social-care/application/ports/commands/report-rights-violation.command";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort, ClockPort } from "@conecta/ports";

export class ReportRightsViolationUseCase
  implements
    UseCasePort<ReportRightsViolationCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
    private readonly clock: ClockPort,
  ) {}

  async execute(
    command: Readonly<ReportRightsViolationCommand>,
  ): Promise<Result<boolean, DomainError>> {
    throw new Error("Not implemented");
  }
}
