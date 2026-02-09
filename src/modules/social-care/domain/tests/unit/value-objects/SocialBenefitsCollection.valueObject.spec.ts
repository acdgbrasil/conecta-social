import { describe, expect, test } from "bun:test";
import { List } from "@conecta/fn";
import { FamilyMemberId, SocialBenefit, SocialBenefitsCollection } from "@conecta/social-care";
import { SBC } from "../../../errors/SocialBenefitsCollection.error";
import { Result } from "@conecta/result";

describe("SocialBenefitsCollection.valueObject (FP Refactor - RED)", () => {
  const BEN_ID = Result.unwrap(FamilyMemberId.create());
  const BENEFIT_A = Result.unwrap(SocialBenefit.create({ benefitName: "A", amount: 100, beneficiaryId: BEN_ID }));
  const BENEFIT_B = Result.unwrap(SocialBenefit.create({ benefitName: "B", amount: 200, beneficiaryId: BEN_ID }));

  describe("Factory", () => {
    test("create valida duplicatas", () => {
      const result = SocialBenefitsCollection.create([BENEFIT_A, BENEFIT_A]);
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SBC.DuplicateBenefitNotAllowed("").code);
    });

    test("create aceita array vazio", () => {
      const result = SocialBenefitsCollection.create([]);
      expect(Result.isOk(result)).toBe(true);
      expect(SocialBenefitsCollection.isEmpty(Result.unwrap(result))).toBe(true);
    });
  });

  describe("Namespace Helpers", () => {
    test("getTotalAmount calcula soma", () => {
      const col = Result.unwrap(SocialBenefitsCollection.create([BENEFIT_A, BENEFIT_B]));
      // Static call
      expect(SocialBenefitsCollection.getTotalAmount(col)).toBe(300);
    });

    test("count retorna tamanho", () => {
      const col = Result.unwrap(SocialBenefitsCollection.create([BENEFIT_A]));
      expect(SocialBenefitsCollection.count(col)).toBe(1);
    });
    
    test("getAll retorna array readonly (List)", () => {
       const col = Result.unwrap(SocialBenefitsCollection.create([BENEFIT_A]));
       const list = SocialBenefitsCollection.getAll(col); // Should return ImutableList or readonly array
       expect(List.count(list)).toBe(1);
    });
  });
});
