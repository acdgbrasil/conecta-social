import { describe, expect, test } from "bun:test";
import { SocialHealthSummary } from "@conecta/social-care";
import { ImutableListFactory } from "@conecta/fn";

describe("SocialHealthSummary.valueObject - red scenarios", () => {
  test("deve falhar quando não remove dependências duplicadas automaticamente", () => {
    const duplicatedDependencies = ImutableListFactory.fromArray([
      "Alimentação",
      "Alimentação",
    ]);

    const result = SocialHealthSummary.create({
      requiresConstantCare: false,
      hasMobilityImpairment: false,
      functionalDependencies: duplicatedDependencies,
      hasRelevantDrugTheapy: false,
    });

    expect(result.isOk).toBe(true);
  });
});
