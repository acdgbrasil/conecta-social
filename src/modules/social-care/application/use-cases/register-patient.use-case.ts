import { Result } from "@conecta/result";
import { List, UseCasePipeline } from "@conecta/fn";
import { AppError } from "@conecta/social-care/application/errors/application.error";
import type { RegisterNewPatientCommand } from "@conecta/social-care/application/ports/commands/register-new-patient.command";
import { Patient } from "@conecta/social-care/domain/entities";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import {
  Diagnosis,
  ICDCode,
  PersonId,
  Timestamp,
} from "@conecta/social-care/domain/value-objects";
import type { DomainError } from "@conecta/domain-error";
import type { EventBusPort } from "@conecta/ports";

export type RegisterNewPatientDeps = {
  readonly repository: PatientRepositoryPort;
  readonly eventBus: EventBusPort;
};

export const makeRegisterNewPatientUseCase = (deps: RegisterNewPatientDeps) =>
  UseCasePipeline.build({
    parse: (command: Readonly<RegisterNewPatientCommand>) => {
      const personIdResult = PersonId.create(command.personId);
      if (Result.isErr(personIdResult)) return Result.err(personIdResult.error);

      const diagnosesResults = command.initialDiagnoses.map((d) =>
        Result.flatMap(ICDCode.create(d.icdCode), (icdCode) =>
          Result.flatMap(Timestamp.create({ value: d.date }), (date) =>
            Diagnosis.create({ date, description: d.description, id: icdCode }, date)
          )
        )
      );

      const diagnosesResult = Result.all(diagnosesResults);
      if (Result.isErr(diagnosesResult)) return Result.err(diagnosesResult.error);

      return Result.ok({
        personId: personIdResult.value,
        diagnoses: diagnosesResult.value,
      });
    },

    handle: async function* (ctx) {
      const exists = yield deps.repository.existsByPersonId(ctx.personId);
      if (exists) return Result.err(AppError.PersonIdAlreadyExists());

      const newPatient = yield Patient.createFromScratch(
        ctx.personId,
        ctx.diagnoses,
      );

      return Result.ok({ aggregate: newPatient, result: true });
    },

    repository: deps.repository,
    eventBus: deps.eventBus,
    pullEvents: Patient.pullDomainEvents,
  });