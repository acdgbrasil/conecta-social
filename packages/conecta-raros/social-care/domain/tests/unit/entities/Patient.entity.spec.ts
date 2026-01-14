import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";
import {
  Diagnosis,
  FamilyMember,
  FamilyMemberId,
  ICDCode,
  Patient,
  PersonId,
  Timestamp,
} from "packages/conecta-raros/social-care";

// Mock providers (simples objetos para teste unitário de entidade)
const mockDeps = {
  idProvider: { generate: () => "018f4a7a-1e37-7b2c-8f00-123456789abc" },
  clock: {
    now: () => new Date("2023-01-01T12:00:00Z"),
    nowIsoString: () => "2023-01-01T12:00:00.000Z",
  },
};

describe("Entity: Patient", () => {
  const personId = PersonId.create(
    "018f4a7a-1e37-7b2c-8f00-123456789abc",
  ).unwrap();
  const icdCode = ICDCode.create("A00.0").unwrap();
  const timestamp = Timestamp.create({ value: mockDeps.clock.now() }).unwrap();
  const diagnosis = Diagnosis.create(
    { id: icdCode, date: timestamp, description: "Test" },
    timestamp,
  ).unwrap();
  const diagnosisList = ImutableListFactory.fromArray([diagnosis]);

  test("Deve criar um paciente do zero (CreateFromScratch) corretamente", () => {
    // Ação
    const result = Patient.createFromScratch(personId, diagnosisList, {
      clock: mockDeps.clock,
      idProvider: mockDeps.idProvider,
    });

    // Verificação (Estado B)
    expect(result.isOk).toBe(true);
    const patient = result.unwrap();

    expect(patient.personId.toString()).toBe(personId.toString());
    expect(patient.diagnoses.count()).toBe(1);
    expect(patient.version).toBe(0);

    // Validação de Eventos
    const events = patient.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].name).toBe("PatientCreated");
    expect(events[0].occurredAt).toEqual(mockDeps.clock.now());
  });

  test("Não deve criar paciente com lista de diagnósticos vazia", () => {
    const emptyList = ImutableListFactory.empty<Diagnosis>();
    const result = Patient.createFromScratch(personId, emptyList, mockDeps);

    expect(result.isErr).toBe(true);
    // Verificar se o erro é o esperado (InitialDiagnosesCantBeEmpty)
    const error = result.unwrapErr();
    expect(error.code).toBe("PAT-001");
    expect(error.message).toBe(
      "Paciente não pode ser criado sem um diagnóstico inicial.",
    );
  });

  test("Deve adicionar um membro da família e gerar evento", () => {
    // Setup (Estado A)
    const patient = Patient.createFromScratch(personId, diagnosisList).unwrap();

    const validFamilyMemberId = FamilyMemberId.create(
      "018f4a7a-1e37-7b2c-8f00-123456789abc",
    ).unwrap();
    const validPersonId = PersonId.create(
      "018f4a7a-1e37-7b2c-8f00-123456789abc",
    ).unwrap();

    const familyMember = FamilyMember.create({
      personId: validPersonId,
      relationship: "SPOUSE",
      isPrimaryCaregiver: true,
      residesWithPatient: true,
      id: validFamilyMemberId,
    }).unwrap();

    // Ação
    const updatedPatientResult = patient.addFamilyMember(familyMember);

    // Verificação (Estado B)
    expect(updatedPatientResult.isOk).toBe(true);
    const updatedPatient = updatedPatientResult.unwrap();

    expect(updatedPatient.familyMembers.count()).toBe(1);

    // Validação de Eventos (Deve ter acumulado o Created + Added)
    const events = updatedPatient.pullDomainEvents();
    expect(events.length).toBe(2);
    expect(events[1].name).toBe("FamilyMemberAdded");
    expect(events[1].payload.relationship).toBe("SPOUSE");
  });

  test("Não deve adicionar membro da família duplicado", () => {
    // Setup
    let patient = Patient.createFromScratch(
      personId,
      diagnosisList,
      mockDeps,
    ).unwrap();

    const validMemberId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
    const memberId = PersonId.create(validMemberId).unwrap();
    const familyMemberId = FamilyMemberId.create(validMemberId).unwrap();

    const familyMember = FamilyMember.create({
      id: familyMemberId,
      personId: memberId,
      relationship: "CHILD",
      isPrimaryCaregiver: false,
      residesWithPatient: true,
    }).unwrap();

    patient = patient.addFamilyMember(familyMember).unwrap();

    // Ação (Tentar adicionar o mesmo membro novamente)
    const result = patient.addFamilyMember(familyMember);

    // Verificação
    expect(result.isErr).toBe(true);

    // Verificando pelo código do erro (PAT-005: FamilyMemberAlreadyExists)
    expect(result.unwrapErr().code).toBe("PAT-005");
  });
});
