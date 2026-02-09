import { describe, expect, test } from "bun:test";
import { SHSDE, SocialHealthSummary } from "@conecta/social-care";
import { Result } from "@conecta/result";

describe("SocialHealthSummary.valueObject (FP Refactor - RED)", () => {
  const validProps = {
    requiresConstantCare: false,
    hasMobilityImpairment: false,
    functionalDependencies: ["Eating"],
    hasRelevantDrugTherapy: false
  };

  describe("Factory", () => {
    test("create deduplica dependências", () => {
      const result = SocialHealthSummary.create({ ...validProps, functionalDependencies: ["Eating", "Eating"] });
      expect(Result.isOk(result)).toBe(true);
      expect(Result.unwrap(result).functionalDependencies).toEqual(["Eating"]);
    });

    test("create falha com string vazia", () => {
      const result = SocialHealthSummary.create({ ...validProps, functionalDependencies: [""] });
      expect(Result.isErr(result)).toBe(true);
      expect(Result.unwrapErr(result).code).toBe(SHSDE.FunctionalDependenciesEmpty().code);
    });
  });
});
