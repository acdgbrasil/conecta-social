import { describe, expect, test } from "bun:test";
import {
	FamilyMemberId,
	SES,
	SocioEconomicSituation,
	SocialBenefit,
	SocialBenefitsCollection,
} from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("SocioEconomicSituation.valueObject (FP Refactor - RED)", () => {
  const EMPTY_BENEFITS = Result.unwrap(SocialBenefitsCollection.create([]));
  
  const validProps = {
    totalFamilyIncome: 1000,
    incomePerCapita: 500,
    receivesSocialBenefit: false,
    socialBenefits: EMPTY_BENEFITS,
    mainSourceOfIncome: "Job",
    hasUnemployed: false
  };

  const withBenefits = () => {
    const beneficiary = Result.unwrap(
      FamilyMemberId.create("018f4a7a-1e37-7b2c-8f00-999999999999"),
    );
    const benefit = Result.unwrap(
      SocialBenefit.create({
        benefitName: "Bolsa",
        amount: 200,
        beneficiaryId: beneficiary,
      }),
    );
    return Result.unwrap(SocialBenefitsCollection.create([benefit]));
  };

  describe("Factory", () => {
    test("create valida consistência de benefícios", () => {
      const result = SocioEconomicSituation.create({ ...validProps, receivesSocialBenefit: true, socialBenefits: EMPTY_BENEFITS });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SES.MissingSocialBenefits().code);
    });

    test("create valida renda negativa", () => {
      const result = SocioEconomicSituation.create({ ...validProps, totalFamilyIncome: -1 });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SES.NegativeFamilyIncome(0).code);
    });

    test("create valida inconsistência quando há benefícios mas receivesSocialBenefit=false", () => {
      const result = SocioEconomicSituation.create({
        ...validProps,
        receivesSocialBenefit: false,
        socialBenefits: withBenefits(),
      });

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(
        SES.InconsistentSocialBenefit().code,
      );
    });

    test("create valida incomePerCapita negativa", () => {
      const result = SocioEconomicSituation.create({
        ...validProps,
        incomePerCapita: -10,
      });

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(
        SES.NegativeIncomePerCapita(0).code,
      );
    });

    test("create valida mainSourceOfIncome vazia", () => {
      const result = SocioEconomicSituation.create({
        ...validProps,
        mainSourceOfIncome: "   ",
      });

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SES.EmptyMainSourceOfIncome().code);
    });

    test("create valida renda per capita maior que renda total", () => {
      const result = SocioEconomicSituation.create({
        ...validProps,
        incomePerCapita: 1500,
        totalFamilyIncome: 1000,
      });

      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(
        SES.InconsistentIncomePerCapita(1500, 1000).code,
      );
    });
  });
});
