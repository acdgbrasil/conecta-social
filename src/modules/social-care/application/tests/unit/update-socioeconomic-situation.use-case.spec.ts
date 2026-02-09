import { Result } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import {
  Diagnosis,
  FamilyMemberId,
  ICDCode,
  P,
  Patient,
  PersonId,
  SocialBenefit,
  SocialBenefitsCollection,
  SocioEconomicSituation,
  Timestamp,
} from "@conecta/social-care";
import { Option } from "@conecta/option";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.port";
import { List } from "@conecta/fn";
import { makeUpdateSocioEconomicSituationUseCase } from "@conecta/social-care/application/use-cases/update-socioeconomic-situation.use-case";
import type { UseCasePort } from "@conecta/ports";
import type { UpdateSocioEconomicSituationCommand } from "@conecta/social-care/application/ports/commands/update-socioeconomic-situation.command";
import type { DomainError } from "@conecta/domain-error/DomainError";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

const makePatient = (): Patient => {
  const personId = Result.unwrap(PersonId.create(PATIENT_UUID));
  const icdCode = Result.unwrap(ICDCode.create("A00.0"));
  const timestamp = Result.unwrap(Timestamp.create({ value: NOW }));
  const diagnosis = Result.unwrap(Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ));
  const diagnoses = List.from([diagnosis]);
  const patient = Result.unwrap(Patient.createFromScratch(personId, diagnoses));
  const { patient: cleanPatient } = Patient.pullDomainEvents(patient);
  return cleanPatient;
};

const VALID_SITUATION = (() => {
  const beneficiaryId = Result.unwrap(FamilyMemberId.create(MEMBER_UUID));
  const benefit = Result.unwrap(SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount: 600,
    beneficiaryId,
  }));
  const benefits = Result.unwrap(SocialBenefitsCollection.create([benefit]));
  return Result.unwrap(SocioEconomicSituation.create({
    totalFamilyIncome: 2000,
    incomePerCapita: 500,
    receivesSocialBenefit: true,
    socialBenefits: benefits,
    mainSourceOfIncome: "Trabalho Autônomo",
    hasUnemployed: true,
  }));
})();

describe("UseCase: UpdateSocioEconomicSituation", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UseCasePort<UpdateSocioEconomicSituationCommand, Result<boolean, DomainError>>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () =>
        Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = makeUpdateSocioEconomicSituationUseCase({ repository, eventBus });
  });

  test("deve atualizar situação socioeconômica com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(Option.isSome(savedPatient.props.socioeconomicSituation)).toBe(true);
    expect(Option.unwrap(savedPatient.props.socioeconomicSituation).totalFamilyIncome).toBe(
      2000,
    );
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION,
    });

    expect(Result.isErr(result)).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
