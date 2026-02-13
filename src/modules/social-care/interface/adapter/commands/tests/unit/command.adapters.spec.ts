import { describe, expect, test } from "bun:test";
import { Result } from "@conecta/result";
import { ReferralDestinationService } from "@conecta/social-care/domain/entities/Referral.entity";
import { createAddFamilyMemberCommand } from "../../add-family-member.command.adapter";
import { createAssignPrimaryCaregiverCommand } from "../../assign-primary-caregiver.command.adapter";
import { createCreateReferralCommand } from "../../create-referral.command.adapter";
import { createRegisterAppointmentCommand } from "../../register-appointment.command.adapter";
import { createRegisterNewPatientCommand } from "../../register-new-patient.command.adapter";
import { createRemoveFamilyMemberCommand } from "../../remove-family-member.command.adapter";
import { createReportRightsViolationCommand } from "../../report-rights-violation.command.adapter";
import { createUpdateHousingConditionCommand } from "../../update-housing-condition.command.adapter";
import { createUpdateSocioEconomicSituationCommand } from "../../update-socioeconomic-situation.command.adapter";

const PATIENT_ID = "018f4a7a-1e37-7b2c-8f00-123456789abc";
const MEMBER_ID = "018f4a7a-1e37-7b2c-8f00-999999999999";
const PROFESSIONAL_ID = "018f4a7a-1e37-7b2c-8f00-888888888888";
const THIRD_ID = "018f4a7a-1e37-7b2c-8f00-777777777777";

describe("Command Adapters", () => {
	test("createAddFamilyMemberCommand valida sucesso e erro", () => {
		const ok = createAddFamilyMemberCommand({
			patientId: PATIENT_ID,
			memberPersonId: MEMBER_ID,
			relationship: "Mother",
			isResiding: true,
			isCaregiver: false,
		});
		const err = createAddFamilyMemberCommand({ patientId: "invalid" });

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createAssignPrimaryCaregiverCommand valida sucesso e erro", () => {
		const ok = createAssignPrimaryCaregiverCommand({
			patientId: PATIENT_ID,
			memberPersonId: MEMBER_ID,
		});
		const err = createAssignPrimaryCaregiverCommand({ patientId: PATIENT_ID });

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createCreateReferralCommand valida sucesso e erro", () => {
		const ok = createCreateReferralCommand({
			patientId: PATIENT_ID,
			referredPersonId: MEMBER_ID,
			destinationService: ReferralDestinationService.CRAS,
			reason: "Encaminhamento social",
			professionalId: PROFESSIONAL_ID,
		});
		const err = createCreateReferralCommand({
			patientId: PATIENT_ID,
			referredPersonId: MEMBER_ID,
			destinationService: "INVALID",
			reason: "",
		});

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createRegisterAppointmentCommand valida sucesso e erro", () => {
		const ok = createRegisterAppointmentCommand({
			patientId: PATIENT_ID,
			professionalId: PROFESSIONAL_ID,
			summary: "Atendimento de rotina",
			actionPlan: "Manter acompanhamento",
		});
		const err = createRegisterAppointmentCommand({
			patientId: PATIENT_ID,
			professionalId: "invalid",
			summary: "",
		});

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createRegisterNewPatientCommand valida sucesso e erro", () => {
		const ok = createRegisterNewPatientCommand({
			personId: PATIENT_ID,
			initialDiagnoses: [
				{
					icdCode: "F84.0",
					date: "2024-01-01",
					description: "Descrição de diagnóstico longa o bastante",
				},
			],
		});
		const err = createRegisterNewPatientCommand({
			personId: PATIENT_ID,
			initialDiagnoses: [],
		});

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createRemoveFamilyMemberCommand valida sucesso e erro", () => {
		const ok = createRemoveFamilyMemberCommand({
			patientId: PATIENT_ID,
			memberPersonId: MEMBER_ID,
		});
		const err = createRemoveFamilyMemberCommand({
			patientId: PATIENT_ID,
			memberPersonId: "invalid",
		});

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createReportRightsViolationCommand valida sucesso e erro", () => {
		const ok = createReportRightsViolationCommand({
			patientId: PATIENT_ID,
			victimId: MEMBER_ID,
			violationType: "NEGLECT",
			reportDate: "2024-01-01",
			incidentDate: "2024-01-01",
			descriptionOfFact: "Descrição do fato",
			actionsTaken: "Ações iniciais",
			id: THIRD_ID,
		});
		const err = createReportRightsViolationCommand({
			patientId: "invalid",
			victimId: MEMBER_ID,
			violationType: "",
			reportDate: "invalid",
			incidentDate: "invalid",
			descriptionOfFact: "",
		});

		expect(Result.isOk(ok)).toBe(true);
		expect(Result.isErr(err)).toBe(true);
	});

	test("createUpdateHousingConditionCommand cobre schema inválido e regra de domínio", () => {
		const invalidSchema = createUpdateHousingConditionCommand({
			patientId: "invalid",
			condition: {},
		});
		const invalidDomain = createUpdateHousingConditionCommand({
			patientId: PATIENT_ID,
			condition: {
				housingConditionType: "OWNED",
				wallMaterial: "MASONRY",
				numberOfRooms: 1,
				numberOfBathrooms: 2,
				waterSupplyType: "PUBLIC_NETWORK",
				electricityAccess: "METERED_CONNECTION",
				sewerDisposalMethod: "PUBLIC_SEWER",
				wasteCollectionType: "DIRECT_COLLECTION",
				accessibilityLevel: "FULLY_ACCESSIBLE",
				isInGeographicRiskArea: false,
				isInSocialConflictArea: false,
			},
		});
		const ok = createUpdateHousingConditionCommand({
			patientId: PATIENT_ID,
			condition: {
				housingConditionType: "OWNED",
				wallMaterial: "MASONRY",
				numberOfRooms: 2,
				numberOfBathrooms: 1,
				waterSupplyType: "PUBLIC_NETWORK",
				electricityAccess: "METERED_CONNECTION",
				sewerDisposalMethod: "PUBLIC_SEWER",
				wasteCollectionType: "DIRECT_COLLECTION",
				accessibilityLevel: "FULLY_ACCESSIBLE",
				isInGeographicRiskArea: false,
				isInSocialConflictArea: false,
			},
		});

		expect(Result.isErr(invalidSchema)).toBe(true);
		expect(Result.isErr(invalidDomain)).toBe(true);
		expect(Result.isOk(ok)).toBe(true);
	});

	test("createUpdateSocioEconomicSituationCommand cobre erros e sucesso", () => {
		const invalidSchema = createUpdateSocioEconomicSituationCommand({
			patientId: "invalid",
			situation: {},
		});
		const invalidBenefit = createUpdateSocioEconomicSituationCommand({
			patientId: PATIENT_ID,
			situation: {
				totalFamilyIncome: 2000,
				incomePerCapita: 1000,
				receivesSocialBenefit: true,
				socialBenefits: [
					{
						benefitName: "Benefício",
						amount: -10,
						beneficiaryId: MEMBER_ID,
					},
				],
				mainSourceOfIncome: "Salário",
				hasUnemployed: false,
			},
		});
		const invalidCollection = createUpdateSocioEconomicSituationCommand({
			patientId: PATIENT_ID,
			situation: {
				totalFamilyIncome: 2000,
				incomePerCapita: 1000,
				receivesSocialBenefit: true,
				socialBenefits: [
					{
						benefitName: "Duplicado",
						amount: 100,
						beneficiaryId: MEMBER_ID,
					},
					{
						benefitName: "Duplicado",
						amount: 200,
						beneficiaryId: THIRD_ID,
					},
				],
				mainSourceOfIncome: "Salário",
				hasUnemployed: false,
			},
		});
		const invalidSituation = createUpdateSocioEconomicSituationCommand({
			patientId: PATIENT_ID,
			situation: {
				totalFamilyIncome: 100,
				incomePerCapita: 500,
				receivesSocialBenefit: false,
				socialBenefits: [],
				mainSourceOfIncome: "Salário",
				hasUnemployed: false,
			},
		});
		const ok = createUpdateSocioEconomicSituationCommand({
			patientId: PATIENT_ID,
			situation: {
				totalFamilyIncome: 2000,
				incomePerCapita: 1000,
				receivesSocialBenefit: true,
				socialBenefits: [
					{
						benefitName: "Bolsa",
						amount: 100,
						beneficiaryId: MEMBER_ID,
					},
				],
				mainSourceOfIncome: "Salário",
				hasUnemployed: false,
			},
		});

		expect(Result.isErr(invalidSchema)).toBe(true);
		expect(Result.isErr(invalidBenefit)).toBe(true);
		expect(Result.isErr(invalidCollection)).toBe(true);
		expect(Result.isErr(invalidSituation)).toBe(true);
		expect(Result.isOk(ok)).toBe(true);
	});

	test("createUpdateSocioEconomicSituationCommand cobre falha de FamilyMemberId.create", () => {
		const result = createUpdateSocioEconomicSituationCommand(
			{
				patientId: PATIENT_ID,
				situation: {
					totalFamilyIncome: 2000,
					incomePerCapita: 1000,
					receivesSocialBenefit: true,
					socialBenefits: [
						{
							benefitName: "Bolsa",
							amount: 100,
							beneficiaryId: MEMBER_ID,
						},
					],
					mainSourceOfIncome: "Salário",
					hasUnemployed: false,
				},
			},
			{
				createFamilyMemberId: () =>
					Result.err({ message: "beneficiary inválido" } as any),
			},
		);

		expect(Result.isErr(result)).toBe(true);
		if (Result.isErr(result)) {
			expect(result.error.code).toBe("CMD-001");
			expect(result.error.message).toContain("beneficiary inválido");
		}
	});
});
