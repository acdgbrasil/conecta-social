import { describe, expect, test } from "bun:test";
import { SES, SocioEconomicSituation, SocialBenefitsCollection } from "@conecta/social-care";
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
  });
});
