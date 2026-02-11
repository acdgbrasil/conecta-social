import { describe, test, expect, mock, beforeEach } from "bun:test";
import { Result } from "@conecta/result";
import { makeSocialCareHttpAdapter, type SocialCareUseCases } from "./social-care.http.adapter";
import type { UseCasePort } from "@conecta/ports";

describe("SocialCareHttpAdapter", () => {
  let mockUseCases: SocialCareUseCases;

  beforeEach(() => {
    mockUseCases = {
      registerPatient: { execute: mock() } as unknown as UseCasePort<any, any>,
      addFamilyMember: { execute: mock() } as unknown as UseCasePort<any, any>,
      removeFamilyMember: { execute: mock() } as unknown as UseCasePort<any, any>,
      registerAppointment: { execute: mock() } as unknown as UseCasePort<any, any>,
      createReferral: { execute: mock() } as unknown as UseCasePort<any, any>,
      reportRightsViolation: { execute: mock() } as unknown as UseCasePort<any, any>,
      updateHousingCondition: { execute: mock() } as unknown as UseCasePort<any, any>,
      updateSocioEconomicSituation: { execute: mock() } as unknown as UseCasePort<any, any>,
    };
  });

  describe("POST /patients", () => {
    test("should return 201 when patient is registered successfully", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientData = {
        personId: "018f4a7a-1e37-7b2c-8f00-123456789abc",
        initialDiagnoses: [
          { icdCode: "F84.0", date: "2024-01-01", description: "Initial diagnosis of autism" }
        ],
      };

      (mockUseCases.registerPatient.execute as any).mockResolvedValue(
        Result.ok({ id: patientData.personId })
      );

      const res = await app.request("/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(res.headers.get("Location")).toBe(`/social-care/patients/${patientData.personId}`);
    });

    test("should return 400 when input is invalid", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const invalidData = {
        personId: "invalid-uuid",
      };

      const res = await app.request("/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    test("should return 409 when patient already exists (Domain Error)", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientData = {
        personId: "018f4a7a-1e37-7b2c-8f00-123456789abc",
        initialDiagnoses: [
          { icdCode: "F84.0", date: "2024-01-01", description: "Initial diagnosis of autism" }
        ],
      };

      (mockUseCases.registerPatient.execute as any).mockResolvedValue(
        Result.err({ code: "CONFLICT", message: "Patient already exists" })
      );

      const res = await app.request("/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Patient already exists");
    });
  });

  describe("POST /patients/{id}/family-members", () => {
    test("should merge patientId from URL and return 200 on success", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const memberData = {
        memberPersonId: "018f4a7a-1e37-7b2c-8f00-999999999999",
        relationship: "Mother",
        isResiding: true,
        isCaregiver: true,
      };

      (mockUseCases.addFamilyMember.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/family-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });

      expect(res.status).toBe(200);
      expect(mockUseCases.addFamilyMember.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId,
          memberPersonId: memberData.memberPersonId,
        })
      );
    });
  });

  describe("DELETE /patients/{id}/family-members/{memberId}", () => {
    test("should merge patientId and memberId from URL and return 200", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const memberId = "018f4a7a-1e37-7b2c-8f00-999999999999";

      (mockUseCases.removeFamilyMember.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/family-members/${memberId}`, {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
      expect(mockUseCases.removeFamilyMember.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId,
          memberPersonId: memberId,
        })
      );
    });
  });

  describe("POST /patients/{id}/appointments", () => {
    test("should return 201 on success", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const data = { professionalId: "018f4a7a-1e37-7b2c-8f00-888888888888", summary: "Test" };

      (mockUseCases.registerAppointment.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      expect(res.status).toBe(201);
    });
  });

  describe("PATCH /patients/{id}/housing-condition", () => {
    test("should merge patientId and wrap body into 'condition' property", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const conditionData = { 
        housingConditionType: "OWNED",
        wallMaterial: "MASONRY",
        numberOfRooms: 4,
        numberOfBathrooms: 2,
        waterSupplyType: "PUBLIC_NETWORK",
        electricityAccess: "METERED_CONNECTION",
        sewerDisposalMethod: "PUBLIC_SEWER",
        wasteCollectionType: "DIRECT_COLLECTION",
        accessibilityLevel: "FULLY_ACCESSIBLE",
        isInGeographicRiskArea: false,
        isInSocialConflictArea: false,
      };

      (mockUseCases.updateHousingCondition.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/housing-condition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conditionData),
      });

      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /patients/{id}/socioeconomic-situation", () => {
    test("should merge patientId and wrap body into 'situation' property", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const situationData = { 
        totalFamilyIncome: 5000,
        incomePerCapita: 1250,
        receivesSocialBenefit: true,
        socialBenefits: [
          {
            benefitName: "Bolsa Familia",
            amount: 600,
            beneficiaryId: "018f4a7a-1e37-7b2c-8f00-999999999999"
          }
        ],
        mainSourceOfIncome: "Salary",
        hasUnemployed: false
      };

      (mockUseCases.updateSocioEconomicSituation.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/socioeconomic-situation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(situationData),
      });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /patients/{id}/referrals", () => {
    test("should return 201 on success", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const data = { 
        referredPersonId: "018f4a7a-1e37-7b2c-8f00-777777777777",
        destinationService: "HEALTH_CARE",
        reason: "Routine checkup",
      };

      (mockUseCases.createReferral.execute as any).mockResolvedValue(Result.ok({ success: true }));

      const res = await app.request(`/patients/${patientId}/referrals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      expect(res.status).toBe(201);
    });
  });

  describe("POST /patients/{id}/rights-violations", () => {
    test("should return 201 on success", async () => {
      const app = makeSocialCareHttpAdapter(mockUseCases);
      const patientId = "018f4a7a-1e37-7b2c-8f00-123456789abc";
      const data = { 
        victimId: patientId,
        violationType: "NEGLIGENCIA",
        reportDate: "2024-01-01",
        incidentDate: "2024-01-01",
        descriptionOfFact: "Test description",
      };

      (mockUseCases.reportRightsViolation.execute as any).mockResolvedValue(Result.ok({ id: "report-123" }));

      const res = await app.request(`/patients/${patientId}/rights-violations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      expect(res.status).toBe(201);
      expect(res.headers.get("Location")).toContain("rights-violations/report-123");
    });
  });
});
