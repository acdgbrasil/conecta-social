import { describe, expect, test } from "bun:test";
import { BE, FamilyMemberId, SocialBenefit } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("SocialBenefit.valueObject (FP Refactor - RED)", () => {
  const BEN_ID = Result.unwrap(FamilyMemberId.create());

  describe("Factory", () => {
    test("cria benefício válido", () => {
      const result = SocialBenefit.create({
        benefitName: "Bolsa",
        amount: 100,
        beneficiaryId: BEN_ID
      });
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).amount).toBe(100);
    });

    test("falha com valor negativo", () => {
      const result = SocialBenefit.create({ benefitName: "A", amount: -10, beneficiaryId: BEN_ID });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(BE.AmountInvalid(0).code);
    });
  });

  describe("Evolução", () => {
    test("create revalida atualizações", () => {
      const original = Result.unwrap(SocialBenefit.create({ benefitName: "A", amount: 100, beneficiaryId: BEN_ID }));
      const updated = SocialBenefit.create({
        ...original,
        amount: 200,
        beneficiaryId: BEN_ID,
      });
      expect(Result.isOk(updated)).toBe(true);
      expect(Result.unwrap(updated).amount).toBe(200);
    });
  });
});
