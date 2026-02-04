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
import type { PatientRepositoryProtocol } from "../../../domain/repository/patient.repository.protocol";
import { ImutableListFactory } from "@conecta/fn";
import { AddFamilyMemberUseCase } from "@conecta/social-care/application/use-cases/add-family-member.use-case";

const NOW = new Date("2025-01-01T12:00:00Z");
const VALID_UUID = "018f4a7a-1e37-7b2c-8f00-123456789abc";

const makePatient = (): Patient => {
  const personId = PersonId.create(VALID_UUID).unwrap();
  const icdCode = ICDCode.create("A00.0").unwrap();
  const timestamp = Timestamp.create({ value: NOW }).unwrap();
  const diagnosis = Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Diagnóstico inicial" },
    timestamp,
  ).unwrap();
  const diagnoses = ImutableListFactory.fromArray([diagnosis]);
  return Patient.createFromScratch(personId, diagnoses).unwrap();
};

describe("UseCase: AddFamilyMember", () => {
  let repository: PatientRepositoryProtocol;
  let eventBus: any;
  let useCase: AddFamilyMemberUseCase;

  beforeEach(() => {
    repository = {
      save: mock(async () => ok(undefined)),
      findByPersonId: mock(async () => err(P.PatientNotFound({ id: VALID_UUID }))),
      addFamilyMember: mock(async () => ok(undefined)),
      existsByPersonId: mock(),
    } as any;

    eventBus = inMemoryEventBus();
    useCase = new AddFamilyMemberUseCase(repository, eventBus);
  });

  test("deve adicionar membro, salvar e publicar evento", async () => {
    const patient = makePatient();
    (repository.findByPersonId as any).mockResolvedValue(ok(patient));

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(result.isOk).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.published.length).toBe(1);
    expect(eventBus.published[0].name).toBe("FamilyMemberAdded");
  });

  test("deve retornar erro quando paciente não existe", async () => {
    (repository.findByPersonId as any).mockResolvedValue(err(P.PatientNotFound({ id: VALID_UUID })));

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.unwrapErr().code).toBe(P.PatientNotFound({ id: VALID_UUID }).code);
    expect(repository.save).not.toHaveBeenCalled();
    expect(eventBus.published.length).toBe(0);
  });

  test("deve retornar erro quando membro já existe na família", async () => {
    const patient = makePatient();
    
    // Adiciona o membro primeiro
    const personId = PersonId.create(VALID_UUID).unwrap();
    const familyMemberId = FamilyMemberId.create(VALID_UUID).unwrap();
    const member = FamilyMember.create({
      id: familyMemberId,
      personId,
      relationship: "SPOUSE",
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    }).unwrap();
    const patientWithMember = patient.addFamilyMember(member).unwrap();
    
    (repository.findByPersonId as any).mockResolvedValue(ok(patientWithMember));

    const result = await useCase.execute({
      patientId: VALID_UUID,
      memberPersonId: VALID_UUID,
      relationship: "SPOUSE",
      isResiding: true,
      isCaregiver: false,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.unwrapErr().code).toBe(P.FamilyMemberAlreadyExists({ memberId: VALID_UUID }).code);
  });
});
