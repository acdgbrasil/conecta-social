import { ok, err } from "@conecta/result";
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
} from "packages/conecta-raros/social-care";
import type { PatientRepositoryProtocol } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { RemoveFamilyMemberUseCase } from "@conecta/social-care/application/use-cases/remove-family-member.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";

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

const makeMember = (uuid: string): FamilyMember => {
  return FamilyMember.create({
    id: FamilyMemberId.create(uuid).unwrap(),
    personId: PersonId.create(uuid).unwrap(),
    relationship: "SPOUSE",
    isPrimaryCaregiver: false,
    residesWithPatient: true,
  }).unwrap();
};

describe("UseCase: RemoveFamilyMember", () => {
  let repository: PatientRepositoryProtocol;
  let eventBus: any;
  let useCase: RemoveFamilyMemberUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () => err(P.PatientNotFound({ id: PATIENT_UUID }))),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    } as any;

    eventBus = inMemoryEventBus();
    useCase = new RemoveFamilyMemberUseCase(repository, eventBus);
  });

  test("deve remover membro da família com sucesso", async () => {
    let patient = makePatient();
    const member = makeMember(MEMBER_UUID);
    patient = patient.addFamilyMember(member).unwrap();
    
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    
    const savedPatient = (repository.save as any).mock.calls[0][0] as Patient;
    const memberExists = savedPatient.familyMembers.getAll().some(m => m.personId.toString() === MEMBER_UUID);
    expect(memberExists).toBe(false);
  });

  test("deve retornar erro quando o membro não existe na família", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.unwrapErr().code).toBe(P.FamilyMemberNotFound({ personId: MEMBER_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    (repository.findByPersonId as any).mockResolvedValue(err(P.PatientNotFound({ id: PATIENT_UUID })));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_UUID,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
