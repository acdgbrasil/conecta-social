import { describe, expect, test } from "bun:test";
import { SocialHealthSummary } from "@conecta/social-care";
import { ImutableListFactory } from "@conecta/fn";

describe("SocialHealthSummary.valueObject", () => {
  test("deve criar com sucesso um resumo mesmo quando não há dependências funcionais registradas", () => {
    // Arrange
    const result = SocialHealthSummary.create({
        requiresConstantCare: true,
        hasMobilityImpairment: false,
        functionalDependencies: ImutableListFactory.empty<string>(),
        hasRelevantDrugTheapy: true,
    });

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const summary = result.unwrap();
    expect(summary.functionalDependencies.length).toBe(0);
  });

  test("deve criar resumo com dependências únicas, removendo duplicatas", () => {
    // Arrange
    const dependencies = ImutableListFactory.fromArray(["Alimentação", "Banho", "Alimentação"]);
    const result = SocialHealthSummary.create({
        requiresConstantCare: true,
        hasMobilityImpairment: true,
        functionalDependencies: dependencies,
        hasRelevantDrugTheapy: false,
    });

    // Assert
    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const summary = result.unwrap();
    expect(summary.functionalDependencies).toEqual(["Alimentação", "Banho"]);
    expect(summary.hasMobilityImpairment).toBe(true);
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
