import { Result } from "@conecta/result";
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
import { List } from "@conecta/fn";
import { makeUpdateHousingConditionUseCase } from "@conecta/social-care/application/use-cases/update-housing-condition.use-case";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { UpdateHousingConditionCommand } from "@conecta/social-care/application/ports/commands/update-housing-condition.command";
import type { DomainError } from "@conecta/domain-error";

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

const VALID_CONDITION = Result.unwrap(HousingCondition.create({
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
}));

describe("UseCase: UpdateHousingCondition", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UseCasePort<UpdateHousingConditionCommand, Result<boolean, DomainError>>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () =>
        Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
      ),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = makeUpdateHousingConditionUseCase({ repository, eventBus });
  });

  test("deve atualizar condições de moradia com sucesso", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      condition: VALID_CONDITION,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();

    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    expect(Option.isSome(savedPatient.props.housingCondition)).toBe(true);
    expect(Option.unwrap(savedPatient.props.housingCondition).numberOfRooms).toBe(4);
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      condition: VALID_CONDITION,
    });

    expect(Result.isErr(result)).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
