import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn";
import { SHSDE, SocialHealthSummary } from "packages/conecta-raros/social-care";

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
    const dependencies = ImutableListFactory.fromArray([
      "Alimentação",
      "Banho",
      "Alimentação",
    ]);
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

  test("rejeita dependências funcionais vazias ou apenas com espaços", () => {
    const dependencies = ImutableListFactory.fromArray(["Banho", "  "]);
    const result = SocialHealthSummary.create({
      requiresConstantCare: false,
      hasMobilityImpairment: false,
      functionalDependencies: dependencies,
      hasRelevantDrugTheapy: false,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("copyWith", () => {
  const makeSummary = (deps: string[]) => {
    return SocialHealthSummary.create({
      requiresConstantCare: true,
      hasMobilityImpairment: false,
      functionalDependencies: ImutableListFactory.fromArray(deps),
      hasRelevantDrugTheapy: true,
    }).unwrap();
  };

  test("deve revalidar, aplicar trim e deduplicação", () => {
    const original = makeSummary(["Banho"]);
    const newDependencies = ImutableListFactory.fromArray([
      "  Alimentação  ",
      "Medicação",
      "Alimentação",
    ]);

    const result = original.copyWith({
      functionalDependencies: newDependencies,
    });

    expect(result.isOk).toBe(true);
    const copied = result.unwrap();

    expect(copied.functionalDependencies).toEqual(["Alimentação", "Medicação"]);
  });

  test("deve falhar a revalidação se a lista injetada contiver strings vazias", () => {
    const original = makeSummary(["Banho"]);
    const invalidDependencies = ImutableListFactory.fromArray([
      "Alimentação",
      "   ", // Inválido
    ]);

    const result = original.copyWith({
      functionalDependencies: invalidDependencies,
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe(
      SHSDE.FunctionalDependenciesEmpty().code,
    ); // "SHS-001"
  });

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
