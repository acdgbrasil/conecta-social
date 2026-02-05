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
} from "@conecta/social-care";
import type { PatientRepositoryPort } from "@conecta/social-care/domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { AssignPrimaryCaregiverUseCase } from "@conecta/social-care/application/use-cases/assign-primary-caregiver.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const PATIENT_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_1_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abd";
const MEMBER_2_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abe";

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

const makeMember = (uuid: string, isCaregiver: boolean): FamilyMember => {
  return FamilyMember.create({
    id: FamilyMemberId.create(uuid).unwrap(),
    personId: PersonId.create(uuid).unwrap(),
    relationship: "SPOUSE",
    isPrimaryCaregiver: isCaregiver,
    residesWithPatient: true,
  }).unwrap();
};

describe("UseCase: AssignPrimaryCaregiver", () => {
  let repository: PatientRepositoryPort;
  let eventBus: any;
  let useCase: AssignPrimaryCaregiverUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () => err(P.PatientNotFound({ id: PATIENT_UUID }))),
      existsByPersonId: mock(),
      addFamilyMember: mock(),
    } as any;
    
    eventBus = inMemoryEventBus();
    useCase = new AssignPrimaryCaregiverUseCase(repository, eventBus);
  });

  test("deve trocar o cuidador principal com sucesso", async () => {
    let patient = makePatient();
    const member1 = makeMember(MEMBER_1_UUID, true);
    const member2 = makeMember(MEMBER_2_UUID, false);
    
    patient = patient.addFamilyMember(member1).unwrap();
    patient = patient.addFamilyMember(member2).unwrap();
    
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_2_UUID,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    
    // Verifica se salvou o paciente com as flags trocadas
    const savedPatient = (repository.save as any).mock.calls[0][0] as Patient;
    const savedMembers = savedPatient.familyMembers.getAll();
    const m1 = savedMembers.find(m => m.personId.toString() === MEMBER_1_UUID);
    const m2 = savedMembers.find(m => m.personId.toString() === MEMBER_2_UUID);

    expect(m1?.isPrimaryCaregiver).toBe(false);
    expect(m2?.isPrimaryCaregiver).toBe(true);
  });

  test("deve retornar erro quando o membro não existe na família", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_1_UUID,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.unwrapErr().code).toBe(P.FamilyMemberNotFound({ personId: MEMBER_1_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
  });

  test("deve retornar erro quando o paciente não existe", async () => {
    (repository.findByPersonId as any).mockResolvedValue(err(P.PatientNotFound({ id: PATIENT_UUID })));

    const result = await useCase.execute({
      patientId: PATIENT_UUID,
      memberPersonId: MEMBER_1_UUID,
    });

    expect(result.isErr).toBe(true);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
