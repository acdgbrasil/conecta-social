import { describe, expect, test } from "bun:test";
import {
  FamilyMemberAddedEvent,
  PatientCreatedEvent,
  ReferralCreatedEvent,
  RightsViolationReportedEvent,
  SocialCareAppointmentRegisteredEvent,
} from "@conecta/social-care/domain/events";

// Estes testes garantem que os eventos seguem o contrato do EventBusPort
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

  describe("ReferralCreatedEvent", () => {
    test("deve carregar dados principais do encaminhamento", () => {
      const event = ReferralCreatedEvent({
        patientId: "uuid-patient",
        referralId: "uuid-referral",
        referredPersonId: "uuid-target",
        destinationService: "CRAS",
        status: "PENDING",
        occurredAt: mockDate,
      });

      expect(event.name).toBe("ReferralCreated");
      expect(event.payload).toEqual({
        patientId: "uuid-patient",
        referralId: "uuid-referral",
        referredPersonId: "uuid-target",
        destinationService: "CRAS",
        status: "PENDING",
      });
    });
  });

  describe("RightsViolationReportedEvent", () => {
    test("deve carregar dados do relato de violação", () => {
      const event = RightsViolationReportedEvent({
        patientId: "uuid-patient",
        reportId: "uuid-report",
        victimId: "uuid-victim",
        violationType: "NEGLECT",
        occurredAt: mockDate,
      });

      expect(event.name).toBe("RightsViolationReported");
      expect(event.payload).toEqual({
        patientId: "uuid-patient",
        reportId: "uuid-report",
        victimId: "uuid-victim",
        violationType: "NEGLECT",
      });
    });
  });

  describe("SocialCareAppointmentRegisteredEvent", () => {
    test("deve carregar dados do atendimento registrado", () => {
      const event = SocialCareAppointmentRegisteredEvent({
        patientId: "uuid-patient",
        appointmentId: "uuid-appointment",
        professionalInChargeId: "uuid-professional",
        type: "FOLLOW_UP",
        occurredAt: mockDate,
      });

      expect(event.name).toBe("SocialCareAppointmentRegistered");
      expect(event.payload).toEqual({
        patientId: "uuid-patient",
        appointmentId: "uuid-appointment",
        professionalInChargeId: "uuid-professional",
        type: "FOLLOW_UP",
      });
    });
  });
});
