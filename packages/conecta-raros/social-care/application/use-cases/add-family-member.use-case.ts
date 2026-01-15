import type { AddFamilyMemberInput } from "@conecta/social-care/domain/inputs/AddFamilyMember.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import type { DomainError, EventBusProtocol, Result } from "src";


export class AddFamilyMemberUseCase {
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
  ) {}

  async execute(
    input: AddFamilyMemberInput,
  ): Promise<Result<boolean, DomainError>> {
    throw new Error("Not implemented");
  }
}
