import { FamilyMemberAddedEvent, PatientCreatedEvent } from "@conecta/social-care/events";
import { describe, expect, test } from "bun:test";

// Estes testes garantem que os eventos seguem o contrato do EventBusProtocol
// e carregam os dados necessários para o downstream (ex: auditoria, projeção).

describe("Social Care Domain Events", () => {
  const mockDate = new Date("2025-01-01T12:00:00Z");

  describe("PatientCreatedEvent", () => {
    test("deve criar estrutura correta do evento", () => {
      const event = PatientCreatedEvent({
        patientId: "uuid-patient",
        personId: "uuid-person",
        occurredAt: mockDate,
      });

      expect(event.name).toBe("PatientCreated");
      expect(event.occurredAt).toBe(mockDate);
      expect(event.payload).toEqual({
        patientId: "uuid-patient",
        personId: "uuid-person",
      });
      // Garante que tem um ID único (tracking)
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe("string");
    });
  });

  describe("FamilyMemberAddedEvent", () => {
    test("deve carregar dados do relacionamento no payload", () => {
      const event = FamilyMemberAddedEvent({
        patientId: "uuid-patient",
        memberId: "uuid-member",
        relationship: "MÃE",
        occurredAt: mockDate,
      });

      expect(event.name).toBe("FamilyMemberAdded");
      expect(event.payload).toEqual({
        patientId: "uuid-patient",
        memberId: "uuid-member",
        relationship: "MÃE",
      });
    });
  });
});
