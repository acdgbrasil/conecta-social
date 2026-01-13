import { PatientRepositoryProtocol } from "packages/conecta-raros/social-care/application/protocols/patient.repository.protocol";
import { EventBusProtocol } from "@conecta/protocols";
import { Result, ok, err } from "@conecta/result";
import { ImutableList, ImutableListFactory } from "@conecta/fn";
import { Diagnosis, ICDCode, Patient, PersonId, Timestamp } from "packages/conecta-raros/social-care";
import { DomainError } from "@conecta/domain-error";
import { AppError } from "packages/conecta-raros/social-care/application/errors/application.error";
import { createDtoIcdCode, createDtoPersonID } from "packages/conecta-raros/social-care/application/dto/patient.dto";

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


  async execute (input: RegisterNewPatientInput): Promise<Result<boolean, DomainError>> {
    const personIdOrError = createDtoPersonID(input.personId);
    if (personIdOrError.isErr) return err(personIdOrError.unwrapErr());
    const personID = personIdOrError.unwrap();

    const existsResult = await this.repository.existsByPersonId(personID);
    if (existsResult.isErr) return err(existsResult.unwrapErr());
    if (existsResult.unwrap() === true) return err(AppError.PersonIdAlreadyExists());

    const diagnosisList: Array<Diagnosis> = [];
    
    for (const _diagnosis of input.initialDiagnoses) {
      const icdCodeOrError = createDtoIcdCode(_diagnosis.icdCode);
      // O TODO anterior sobre falha na criação pode ser devido à chamada duplicada ou erro não tratado corretamente.
      if (icdCodeOrError.isErr) return err(icdCodeOrError.unwrapErr());
      const icdCode = icdCodeOrError.unwrap();

      const timestampOrError = Timestamp.create({ value: _diagnosis.date });
      if (timestampOrError.isErr) return err(timestampOrError.unwrapErr());
      const timestamp = timestampOrError.unwrap();

      const diagnosisOrError = Diagnosis.create({
        id: icdCode,
        date: timestamp,
        description: _diagnosis.description
      }, Timestamp.now().unwrap());
      
      if (diagnosisOrError.isErr) return err(diagnosisOrError.unwrapErr());
      diagnosisList.push(diagnosisOrError.unwrap());
    }

    const immutableDiagnosisList: ImutableList<Diagnosis> = ImutableListFactory.fromArray(diagnosisList);
    const registerNewPatient = Patient.createFromScratch(personID, immutableDiagnosisList);
    
    if (registerNewPatient.isErr) return err(registerNewPatient.unwrapErr());
    
    const patient = registerNewPatient.unwrap();
    const saveResult = await this.repository.save(patient);
    
    if (saveResult.isErr) return err(saveResult.unwrapErr());
    
    this.eventBus.publish(patient.pullDomainEvents());
    return ok(true);
  }

}