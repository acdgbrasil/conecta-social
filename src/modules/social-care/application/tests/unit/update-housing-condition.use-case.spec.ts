import { ok, err } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import {
  Diagnosis,
  HousingCondition,
  ICDCode,
  P,
  Patient,
  PersonId,
  Timestamp,
} from "@conecta/social-care";
import { Option } from "@conecta/option";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { UpdateHousingConditionUseCase } from "@conecta/social-care/application/use-cases/update-housing-condition.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

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

const VALID_CONDITION = HousingCondition.create({
  housingConditionType: "OWNED",
  wallMaterial: "MASONRY",
  numberOfRooms: 4,
  numberOfBathrooms: 2,
  waterSupplyType: "PUBLIC_NETWORK",
  electricityAccess: "METERED_CONNECTION",
  sewerDisposalMethod: "PUBLIC_SEWER",
  wasteCollectionType: "DIRECT_COLLECTION",
  accessibilityLevel: "FULLY_ACCESSIBLE",
  isInGeographicRiskArea: false,
  isInSocialConflictArea: false,
}).unwrap();

describe("UseCase: UpdateHousingCondition", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UpdateHousingConditionUseCase;

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
    useCase = new UpdateHousingConditionUseCase(repository, eventBus);
  });

  test("deve atualizar condições de moradia com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      condition: VALID_CONDITION,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(Option.isSome(savedPatient.housingCondition)).toBe(true);
    expect(Option.unwrap(savedPatient.housingCondition).numberOfRooms).toBe(4);
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      condition: VALID_CONDITION,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
