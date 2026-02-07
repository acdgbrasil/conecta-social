import { describe, expect, test } from "bun:test";
import { List } from "@conecta/fn";
import { Diagnosis, FamilyMember, FamilyMemberId, ICDCode, Patient, PersonId, Timestamp } from "@conecta/social-care";
import { Result } from "@conecta/result";
import { Uuid } from "@conecta/uuid";

const mockDeps = {
  idProvider: { generate: () => "018f4a7a-1e37-7b2c-8f00-123456789abc" },
  clock: { now: () => new Date("2023-01-01T12:00:00Z"), nowIsoString: () => "" },
};

describe("Patient (FP Refactor - RED)", () => {
  const personId = Result.unwrap(PersonId.create("018f4a7a-1e37-7b2c-8f00-123456789abc"));
  const diagnosis = Result.unwrap(Diagnosis.create({
    id: Result.unwrap(ICDCode.create("A00.0")),
    date: Result.unwrap(Timestamp.create({ value: new Date() })),
    description: "Test"
  }, Result.unwrap(Timestamp.create({ value: new Date() }))));
  
  const diagnosisList = List.from([diagnosis]);

  describe("Factory (createFromScratch)", () => {
    test("cria paciente com eventos iniciais", () => {
      const result = Patient.createFromScratch(personId, diagnosisList, mockDeps);
      
      expect(Result.isOk(result)).toBe(true);
      const patient = Result.unwrap(result);
      
      // Validação de Estrutura (Type)
      expect(patient.props.personId.toString()).toBe(personId.toString());
      expect(patient.version).toBe(0);
      
      // Validação de Eventos (Campo 'events' do padrão Aggregate)
      expect(patient.events.length).toBe(1);
      expect(patient.events[0].name).toBe("PatientCreated");
    });
  });

  describe("Behavior (Pure Functions)", () => {
    test("addFamilyMember retorna novo estado com evento", () => {
      const patient = Result.unwrap(Patient.createFromScratch(personId, diagnosisList, mockDeps));
      const member = Result.unwrap(FamilyMember.create({
        id: Result.unwrap(FamilyMemberId.create()),
        personId: Result.unwrap(PersonId.create()),
        relationship: "SPOUSE",
        isPrimaryCaregiver: false,
        residesWithPatient: true
      }));

      // Data-last: Patient.addFamilyMember(patient, member)
      const result = Patient.addFamilyMember(patient, member, mockDeps.clock.now());
      
      expect(Result.isOk(result)).toBe(true);
      const updated = Result.unwrap(result);
      
      expect(updated.props.familyMembers.length).toBe(1); 
      expect(updated.events.length).toBeGreaterThan(1); // Created + Added
      expect(updated).not.toBe(patient); // Imutabilidade
    });
  });
});