import type { UseCaseProtocol } from "@conecta/shared/protocols/UseCase.protocol";
import type { RegisterNewPatientInput } from "@conecta/social-care/domain/inputs/RegisterNewPatient.input";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { err, ok, type Result } from "@conecta/result";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusProtocol } from "@conecta/protocols";
import {
  Diagnosis,
  ICDCode,
  Patient,
  PersonId,
  Timestamp,
} from "@conecta/social-care";
import { ImutableListFactory } from "@conecta/fn";
import { AppError } from "../errors/application.error";

export class RegisterNewPatientUseCase
  implements
    UseCaseProtocol<RegisterNewPatientInput, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryProtocol,
    private readonly eventBus: EventBusProtocol,
  ) {}

  async execute(
    input: Readonly<RegisterNewPatientInput>,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(input.personId);
    if (personIdResult.isErr) return err(personIdResult.error);
    const personId = personIdResult.value;

    const existsResult = await this.repository.existsByPersonId(personId);
    if (existsResult.isErr) return err(existsResult.error);

    if (existsResult.value) return err(AppError.PersonIdAlreadyExists());

    const newDiagnoses: Diagnosis[] = [];
    for (const diagnosisInput of input.initialDiagnoses) {
      const icdCodeResult = ICDCode.create(diagnosisInput.icdCode);
      if (icdCodeResult.isErr) return err(icdCodeResult.error);

      const dateResult = Timestamp.create({ value: diagnosisInput.date });
      if (dateResult.isErr) return err(dateResult.error);
      const timestamp = dateResult.value;

      const diagnosisResult = Diagnosis.create(
        {
          date: timestamp,
          description: diagnosisInput.description,
          id: icdCodeResult.value,
        },
        timestamp,
      );

      if (diagnosisResult.isErr) return err(diagnosisResult.error);
      newDiagnoses.push(diagnosisResult.value);
    }

    const imutableNewDiagnoses = ImutableListFactory.fromArray(newDiagnoses);
    const createPatientResult = Patient.createFromScratch(
      personId,
      imutableNewDiagnoses,
    );
    if (createPatientResult.isErr) return err(createPatientResult.error);
    const newPatient = createPatientResult.value;

    const saveResult = await this.repository.save(newPatient);
    if (saveResult.isErr) return err(saveResult.error);

    const events = newPatient.pullDomainEvents();
    if (events.length > 0) {
      this.eventBus.publish(events);
    }
    
    return ok(true);
  }
}