import {
  err,
  ImutableListFactory,
  ok,
  Some,
  type DomainError,
  type EventBusPort,
  type Result,
  type UseCasePort,
} from "@conecta/shared";
import { AppError } from "@conecta/social-care/application/errors/application.error";
import type { RegisterNewPatientCommand } from "@conecta/social-care/application/ports/commands/register-new-patient.command";
import { Patient } from "@conecta/social-care/domain/entities";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import {
  Diagnosis,
  ICDCode,
  PersonId,
  Timestamp,
} from "@conecta/social-care/domain/value-objects";

// export class RegisterNewPatientUseCase
//   implements
//     UseCasePort<RegisterNewPatientCommand, Result<boolean, DomainError>>
// {
//   constructor(
//     private readonly repository: PatientRepositoryPort,
//     private readonly eventBus: EventBusPort,
//   ) {}

//   async execute(
//     command: Readonly<RegisterNewPatientCommand>,
//   ): Promise<Result<boolean, DomainError>> {
//     const personIdResult = PersonId.create(command.personId);
//     if (personIdResult.isErr) return err(personIdResult.error);
//     const personId = personIdResult.value;

//     const existsResult = await this.repository.existsByPersonId(personId);
//     if (existsResult.isErr) return err(existsResult.error);

//     if (existsResult.value) return err(AppError.PersonIdAlreadyExists());

//     const newDiagnoses: Diagnosis[] = [];
//     for (const diagnosisInput of command.initialDiagnoses) {
//       const icdCodeResult = ICDCode.create(diagnosisInput.icdCode);
//       if (icdCodeResult.isErr) return err(icdCodeResult.error);

//       const dateResult = Timestamp.create({ value: diagnosisInput.date });
//       if (dateResult.isErr) return err(dateResult.error);
//       const timestamp = dateResult.value;

//       const diagnosisResult = Diagnosis.create(
//         {
//           date: timestamp,
//           description: diagnosisInput.description,
//           id: icdCodeResult.value,
//         },
//         timestamp,
//       );

//       if (diagnosisResult.isErr) return err(diagnosisResult.error);
//       newDiagnoses.push(diagnosisResult.value);
//     }

//     const imutableNewDiagnoses = ImutableListFactory.fromArray(newDiagnoses);
//     const createPatientResult = Patient.createFromScratch(
//       personId,
//       imutableNewDiagnoses,
//     );
//     if (createPatientResult.isErr) return err(createPatientResult.error);
//     const newPatient = createPatientResult.value;

//     const saveResult = await this.repository.save(newPatient);
//     if (saveResult.isErr) return err(saveResult.error);

//     const events = newPatient.pullDomainEvents();
//     if (events.length > 0) {
//       this.eventBus.publish(events);
//     }

//     return ok(true);
//   }
// }

export class RegisterNewPatientUseCase
  implements
    UseCasePort<RegisterNewPatientCommand, Result<boolean, DomainError>>
{
  constructor(
    private readonly repository: PatientRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  private createDiagnosis(
    d: RegisterNewPatientCommand["initialDiagnoses"][0],
  ): Result<Diagnosis, DomainError> {
    return ICDCode.create(d.icdCode).flatMap((icdCode) =>
      Timestamp.create({ value: d.date }).flatMap((date) =>
        Diagnosis.create(
          { date, description: d.description, id: icdCode },
          date,
        ),
      ),
    );
  }

  async execute(
    command: RegisterNewPatientCommand,
  ): Promise<Result<boolean, DomainError>> {
    const personIdResult = PersonId.create(command.personId);
    if (personIdResult.isErr) return err(personIdResult.error);
    const personId = personIdResult.value;

    const existsResult = await this.repository.existsByPersonId(personId);
    if (existsResult.isErr) return err(existsResult.error);
    if (existsResult.value) return err(AppError.PersonIdAlreadyExists());

    const diagnosesResults = command.initialDiagnoses.map(d => this.createDiagnosis(d));
    const initialAcc = ok<Diagnosis[], DomainError>([]);
    const diagnosesResult = diagnosesResults.reduce((acc, cur) => {
      return acc.flatMap(list => cur.map(item => [...list, item]));
    }, initialAcc);

    if (diagnosesResult.isErr) return err(diagnosesResult.error);

    const imutableDiagnoses = ImutableListFactory.fromArray(diagnosesResult.value);
  
    const createPatientResult = Patient.createFromScratch(
      personId,
      imutableDiagnoses,
    );
    
    if (createPatientResult.isErr) return err(createPatientResult.error);
    const newPatient = createPatientResult.value;

    const saveResult = await this.repository.save(newPatient);
    if (saveResult.isErr) return err(saveResult.error);

    this.eventBus.publish(newPatient.pullDomainEvents());

    return ok(true);
  }
}
