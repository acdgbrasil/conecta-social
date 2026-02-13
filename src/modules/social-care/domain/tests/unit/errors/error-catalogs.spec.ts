import { describe, expect, test } from "bun:test";
import {
	CSN,
	DE,
	FM,
	HC,
	ICDError,
	RE,
	RVR,
	SBC,
	SCAE,
	SES,
} from "@conecta/social-care";

describe("Domain Error Catalog Shortcuts", () => {
	test("CommunitySupportNetwork, FamilyMember e HousingCondition", () => {
		expect(CSN.FamilyConflictsWhitespace().code).toBe("CSN-001");
		expect(CSN.FamilyConflictsTooLong().code).toBe("CSN-002");
		expect(FM.MissingPerson().code).toBe("FM-001");
		expect(FM.InvalidRelationship().code).toBe("FM-002");
		expect(HC.NegativeRooms().code).toBe("HC-001");
		expect(HC.NegativeBathrooms().code).toBe("HC-002");
		expect(HC.BathroomsExceedRooms().code).toBe("HC-003");
	});

	test("Diagnosis e Referral", () => {
		expect(DE.DateInFuture("2026-01-01", "2025-01-01").code).toBe("DIAG-001");
		expect(DE.DateBeforeYearZero(-1).code).toBe("DIAG-002");
		expect(DE.DescriptionEmpty().code).toBe("DIAG-003");
		expect(DE.InvalidICDCode("X99").code).toBe("DIAG-004");

		expect(RE.DateInFuture().code).toBe("REF-001");
		expect(RE.ReasonMissing().code).toBe("REF-002");
		expect(RE.InvalidStatusTransition("PENDING", "COMPLETED").code).toBe(
			"REF-003",
		);
		expect(RE.InvalidDestinationService("BAD", "CRAS,CREAS").code).toBe(
			"REF-004",
		);
	});

	test("RightsViolation, SocialBenefitsCollection, SocialCareAppointment, SES", () => {
		expect(RVR.ReportDateInFuture().code).toBe("RVR-001");
		expect(RVR.IncidentAfterReport().code).toBe("RVR-002");
		expect(RVR.EmptyDescription().code).toBe("RVR-003");

		expect(SBC.DuplicateBenefitNotAllowed("Auxílio").code).toBe(
			"COLLECTION-001",
		);
		expect(SBC.BenefitsArrayNullOrUndefined().code).toBe("COLLECTION-002");

		expect(SCAE.DateInFuture().code).toBe("SCA-001");
		expect(SCAE.MissingNarrative().code).toBe("SCA-002");
		expect(SCAE.SummaryTooLong(500).code).toBe("SCA-003");
		expect(SCAE.ActionPlanTooLong(2000).code).toBe("SCA-004");
		expect(SCAE.InvalidType("X", "A,B").code).toBe("SCA-005");

		expect(SES.InconsistentSocialBenefit().code).toBe("SES-001");
		expect(SES.MissingSocialBenefits().code).toBe("SES-002");
		expect(SES.NegativeFamilyIncome(-1).code).toBe("SES-003");
		expect(SES.NegativeIncomePerCapita(-2).code).toBe("SES-004");
		expect(SES.EmptyMainSourceOfIncome().code).toBe("SES-005");
		expect(SES.InconsistentIncomePerCapita(20, 10).code).toBe("SES-006");
	});

	test("ICDError direct factories e metadados", () => {
		expect(
			ICDError.InvalidCidNumber({
				received: "X",
				candidate: "X",
				expectedPattern: "regex",
			}).code,
		).toBe("ICD-001");
		expect(ICDError.EmptyCidCode({ field: "icdField" }).code).toBe("ICD-002");
		expect(
			ICDError.RetiredCidCode({ code: "A00", retiredAt: "2020-01-01" }).code,
		).toBe("ICD-003");
		expect(
			ICDError.ContextConflict({ code: "A00", context: "triage" }).code,
		).toBe("ICD-004");
		expect(ICDError.catalog.INVALID_CID_NUMBER.code).toBe("001");
		expect(ICDError.bc).toBe("SOCIAL");
		expect(ICDError.module).toContain("icd-code");
	});
});
