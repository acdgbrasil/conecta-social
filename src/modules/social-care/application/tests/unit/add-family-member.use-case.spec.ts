import { Result } from "@conecta/result";
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { inMemoryEventBus } from "@conecta/adapters";
import {
  Diagnosis,
  FamilyMember,
  FamilyMemberId,
  ICDCode,
  P,
  Patient,
  PersonId,
  Timestamp,
} from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { List } from "@conecta/fn";
import { makeAddFamilyMemberUseCase } from "@conecta/social-care/application/use-cases/add-family-member.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

type MockedFn<T extends (...args: any[]) => any> = ReturnType<typeof mock<T>>;
type PatientRepositoryMock = {
  save: MockedFn<PatientRepositoryPort["save"]>;
  findByPersonId: MockedFn<PatientRepositoryPort["findByPersonId"]>;
  addFamilyMember: MockedFn<PatientRepositoryPort["addFamilyMember"]>;
  existsByPersonId: MockedFn<PatientRepositoryPort["existsByPersonId"]>;
};

const makePatient = (): Patient => {
  const personId = Result.unwrap(PersonId.create(VALID_UUID));
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

describe("UseCase: AddFamilyMember", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: ReturnType<typeof makeAddFamilyMemberUseCase>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () => Result.err(P.PatientNotFound({ id: VALID_UUID }))),
      addFamilyMember: mock(async () => Result.ok(undefined)),
      existsByPersonId: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = makeAddFamilyMemberUseCase({ repository, eventBus });
  });

  test("deve adicionar membro, salvar e publicar evento", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.published.length).toBe(1);
    expect(eventBus.published[0].name).toBe("FamilyMemberAdded");
  });

  test("deve retornar erro quando paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: VALID_UUID })),
    );

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) return;
    expect(Result.unwrapErr(result).code).toBe(P.PatientNotFound({ id: VALID_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
    expect(eventBus.published.length).toBe(0);
  });

  test("deve retornar erro quando membro já existe na família", async () => {
    const patient = makePatient();
    
    // Adiciona o membro primeiro
    const personId = Result.unwrap(PersonId.create(VALID_UUID));
    const familyMemberId = Result.unwrap(FamilyMemberId.create(VALID_UUID));
    const member = Result.unwrap(FamilyMember.create({
      id: familyMemberId,
      personId,
      relationship: "SPOUSE",
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    }));
    const patientWithMember = Result.unwrap(Patient.addFamilyMember(patient, member));
    
    repository.findByPersonId.mockResolvedValue(Result.ok(patientWithMember));

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) return;
    expect(Result.unwrapErr(result).code).toBe(P.FamilyMemberAlreadyExists({ memberId: VALID_UUID }).code);
  });
});
