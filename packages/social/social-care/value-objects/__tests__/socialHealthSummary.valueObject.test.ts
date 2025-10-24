import { describe, expect, test } from "bun:test";
import { ImutableListFactory } from "@conecta/fn/imutable-list";
import { SocialHealthSummary } from "../socialHealthSummary.valueObject";

describe("SocialHealthSummary.valueObject", () => {
  test("retorna erro quando não há dependências funcionais registradas", () => {
    const emptyList = ImutableListFactory.empty<string>();
    const result = SocialHealthSummary.create(true, false, emptyList, true);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SHS-001");
  });

  test("cria resumo com dependências únicas e imutabilidade", () => {
    const list = ImutableListFactory.fromArray([
      "Locomoção assistida",
      "Locomoção assistida",
      "Uso de medicação contínua",
    ]);

    const result = SocialHealthSummary.create(true, true, list, false);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const summary = result.unwrap();
    expect(summary.functionalDependencies).toEqual([
      "Locomoção assistida",
      "Uso de medicação contínua",
    ]);
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
