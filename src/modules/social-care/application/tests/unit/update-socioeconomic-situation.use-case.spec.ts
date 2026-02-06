import { ok, err } from "@conecta/result";
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
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { UpdateSocioEconomicSituationUseCase } from "@conecta/social-care/application/use-cases/update-socioeconomic-situation.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  addFamilyMember: MockedFn<PatientRepositoryPort["addFamilyMember"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

const makePatient = (): Patient => {
  const personId = PersonId.create(PATIENT_UUID).unwrap();
  const icdCode = ICDCode.create("A00.0").unwrap();
  const timestamp = Timestamp.create({ value: NOW }).unwrap();
  const diagnosis = Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ).unwrap();
  const diagnoses = ImutableListFactory.fromArray([diagnosis]);
  return Patient.createFromScratch(personId, diagnoses).unwrap();
};

const VALID_SITUATION = (() => {
  const beneficiaryId = FamilyMemberId.create(MEMBER_UUID).unwrap();
  const benefit = SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount: 600,
    beneficiaryId,
  }).unwrap();
  const benefits = SocialBenefitsCollection.create([benefit]).unwrap();
  return SocioEconomicSituation.create({
    totalFamilyIncome: 2000,
    incomePerCapita: 500,
    receivesSocialBenefit: true,
    socialBenefits: benefits,
    mainSourceOfIncome: "Trabalho Autônomo",
    hasUnemployed: true,
  }).unwrap();
})();

describe("UseCase: UpdateSocioEconomicSituation", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UpdateSocioEconomicSituationUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () =>
        err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = new UpdateSocioEconomicSituationUseCase(repository, eventBus);
  });

  test("deve atualizar situação socioeconômica com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(Option.isSome(savedPatient.socioeconomicSituation)).toBe(true);
    expect(Option.unwrap(savedPatient.socioeconomicSituation).totalFamilyIncome).toBe(
      2000,
    );
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      situation: VALID_SITUATION,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
