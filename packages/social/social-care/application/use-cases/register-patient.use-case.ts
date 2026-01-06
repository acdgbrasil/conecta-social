import { PatientRepositoryProtocol } from "@conecta/social-care/application/repository/patient.repository.protocol";
import { EventBusProtocol } from "@conecta/protocols";
import { Result, ok, err } from "@conecta/result";
import { ImutableList, ImutableListFactory } from "@conecta/fn";
import { Diagnosis, DomainError, guardLet, ICDCode, None, Option, PersonId, Some, Timestamp } from "src";
import { AppError, ApplicationError } from "@conecta/social-care/application/errors/application.error";
import { createDtoPersonID } from "@conecta/social-care/application/dto/patient.dto";

export type RegisterNewPatientInput = {
  personId: string,
  initialDiagnoses: Array<{
    icdCode: string,
    date: Date,
    description: string
  }>,
}

export class RegisterNewPatientUseCase {
  constructor (
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol
  ){}


  async execute (input: RegisterNewPatientInput): Promise<Result<void, DomainError>> {
    if (createDtoPersonID(input.personId).isErr) return err(createDtoPersonID(input.personId).unwrapErr());
    const personID = createDtoPersonID(input.personId).unwrap();
    const personIDAreadyExists = await this.repository.existsByPersonId(personID);
    if (personIDAreadyExists.isOk) return err(AppError.PersonIdAlreadyExists());
    //TODO: (Gabriel) Continuar a implementação daqui - Terminei por hoje 05/01/2026 - 23:26
    return ok(undefined);
  }

}