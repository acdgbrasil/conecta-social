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
import { makeRemoveFamilyMemberUseCase } from "@conecta/social-care/application/use-cases/remove-family-member.use-case";
import type { UseCasePort } from "@conecta/shared/protocols/UseCase.protocol";
import type { RemoveFamilyMemberCommand } from "@conecta/social-care/application/ports/commands/remove-family-member.command";
import type { DomainError } from "@conecta/domain-error";

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

const makeMember = (uuid: string): FamilyMember => {
  return Result.unwrap(FamilyMember.create({
    id: Result.unwrap(FamilyMemberId.create(uuid)),
    personId: Result.unwrap(PersonId.create(uuid)),
    relationship: "SPOUSE",
    isPrimaryCaregiver: false,
    residesWithPatient: true,
  }));
};

describe("UseCase: RemoveFamilyMember", () => {
  let repository: PatientRepositoryMock;
  let eventBus: any;
  let useCase: UseCasePort<RemoveFamilyMemberCommand, Result<boolean, DomainError>>;

  beforeEach(() => {
    repository = {
      save: mock(async () => Result.ok(undefined)),
      findByPersonId: mock(async () => Result.err(P.PatientNotFound({ id: PATIENT_UUID }))),
      addFamilyMember: mock(async () => Result.ok(undefined)),
      existsByPersonId: mock(),
    };

    eventBus = inMemoryEventBus();
    useCase = makeRemoveFamilyMemberUseCase({ repository, eventBus });
  });

  test("deve remover membro da família com sucesso", async () => {
    let patient = makePatient();
    const member = makeMember(MEMBER_UUID);
    patient = Result.unwrap(Patient.addFamilyMember(patient, member));
    
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(Result.isOk(result)).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    
    const savedPatient = repository.save.mock.calls[0][0] as Patient;
    const memberExists = List.toArray(savedPatient.props.familyMembers).some(m => m.personId.toString() === MEMBER_UUID);
    expect(memberExists).toBe(false);
  });

  test("deve retornar erro quando o membro não existe na família", async () => {
    const patient = makePatient();
    repository.findByPersonId.mockResolvedValue(Result.ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) return;
    expect(Result.unwrapErr(result).code).toBe(P.FamilyMemberNotFound({ personId: MEMBER_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    repository.findByPersonId.mockResolvedValue(
      Result.err(P.PatientNotFound({ id: PATIENT_UUID })),
    );

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(Result.isErr(result)).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
