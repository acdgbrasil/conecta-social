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
import { makeAssignPrimaryCaregiverUseCase } from "@conecta/social-care/application/use-cases/assign-primary-caregiver.use-case";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { AssignPrimaryCaregiverCommand } from "@conecta/social-care/application/ports/commands/assign-primary-caregiver.command";
import type { DomainError } from "@conecta/domain-error";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_1_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";
const MEMBER_2_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abe";

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

const makeMember = (uuid: string, isCaregiver: boolean): FamilyMember => {
  return Result.unwrap(FamilyMember.create({
    id: Result.unwrap(FamilyMemberId.create(uuid)),
    personId: Result.unwrap(PersonId.create(uuid)),
    relationship: "SPOUSE",
    isPrimaryCaregiver: isCaregiver,
    residesWithPatient: true,
  }));
};

describe("UseCase: AssignPrimaryCaregiver", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UseCasePort<AssignPrimaryCaregiverCommand, Result<boolean, DomainError>>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () => Result.err(P.PatientNotFound({ id: PATIENT_UUID }))),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    };
    
    eventBus = inMemoryEventBus();
    useCase = makeAssignPrimaryCaregiverUseCase({ repository, eventBus });
  });

  test("deve trocar o cuidador principal com sucesso", async () => {
    let patient = makePatient();
    const member1 = makeMember(MEMBER_1_UUID, true);
    const member2 = makeMember(MEMBER_2_UUID, false);
    
    patient = Result.unwrap(Patient.addFamilyMember(patient, member1));
    patient = Result.unwrap(Patient.addFamilyMember(patient, member2));
    
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_2_UUID,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    
    // Verifica se salvou o paciente com as flags trocadas
    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    const savedMembers = List.toArray(savedPatient.props.familyMembers);
    const m1 = savedMembers.find(m => m.personId.toString() === MEMBER_1_UUID);
    const m2 = savedMembers.find(m => m.personId.toString() === MEMBER_2_UUID);

    expect(m1?.isPrimaryCaregiver).toBe(false);
    expect(m2?.isPrimaryCaregiver).toBe(true);
  });

  test("deve retornar erro quando o membro não existe na família", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_1_UUID,
    });

    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) return;
    expect(Result.unwrapErr(result).code).toBe(P.FamilyMemberNotFound({ personId: MEMBER_1_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_1_UUID,
    });

    expect(Result.isErr(result)).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});