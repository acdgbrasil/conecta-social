import { describe, expect, test } from "bun:test";
import { SocialHealthSummary } from "../socialHealthSummary.valueObject";
import { ImutableListFactory } from "@conecta/fn/imutable-list";

describe("SocialHealthSummary.valueObject", () => {
  test("retorna erro quando não há dependências funcionais registradas", () => {
    const result = SocialHealthSummary.create({
        requiresConstantCare: true,
        hasMobilityImpairment: false,
        functionalDependencies: ImutableListFactory.fromArray([]),
        hasRelevantDrugTheapy: true,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;
    expect(result.error.code).toBe("SHS-001");
  });

  test("cria resumo com dependências únicas e imutabilidade", () => {
    const dependencies = ImutableListFactory.fromArray(["Alimentação", "Banho", "Alimentação"]);
    const result = SocialHealthSummary.create({
        requiresConstantCare: true,
        hasMobilityImpairment: true,
        functionalDependencies: dependencies,
        hasRelevantDrugTheapy: false,
    });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const summary = result.unwrap();
    expect(summary.functionalDependencies).toEqual(["Alimentação", "Banho"]);
    expect(summary.hasMobilityImpairment).toBe(true);
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
