import { describe, expect, test } from "bun:test";
import { SocialBenefit } from "../socialBenefits.valueObjects";
import { SocioEconomicSituation } from "../socioEconimicSituation.valueObject";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

const makeBenefit = (name = "Benefício Família", amount = 150) => {
  const result = SocialBenefit.create(name, amount, VALID_UUID);
  if (!result.isOk) {
    throw new Error("Falha ao criar benefício social para o cenário de teste.");
  }
  return result.unwrap();
};

describe("SocioEconomicSituation.valueObject", () => {
  test("cria situação socioeconômica válida quando dados são consistentes", () => {
    const benefit = makeBenefit();
    const result = SocioEconomicSituation.create(
      1200,
      300,
      true,
      [benefit],
      "Emprego formal",
      false,
    );

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const situation = result.unwrap();
    expect(situation.totalFamilyIncome).toBe(1200);
    expect(situation.socialBenefits).toHaveLength(1);
    expect(situation.socialBenefits[0]).toBe(benefit);
    expect(Object.isFrozen(situation)).toBe(true);
  });

  test("retorna erro quando há benefícios mas flag indica que não recebe", () => {
    const benefit = makeBenefit();
    const result = SocioEconomicSituation.create(
      1200,
      300,
      false,
      [benefit],
      "Emprego formal",
      false,
    );

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SES-001");
  });

  test("retorna erro quando flag indica que recebe mas lista está vazia", () => {
    const result = SocioEconomicSituation.create(
      1200,
      300,
      true,
      [],
      "Emprego formal",
      false,
    );

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SES-002");
  });

  test("retorna erro quando renda familiar total é negativa", () => {
    const result = SocioEconomicSituation.create(
      -1,
      300,
      false,
      [],
      "Emprego formal",
      false,
    );

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SES-003");
  });

  test("retorna erro quando renda per capita é negativa", () => {
    const result = SocioEconomicSituation.create(
      1200,
      -10,
      false,
      [],
      "Emprego formal",
      false,
    );

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SES-004");
  });

  test("retorna erro quando fonte principal de renda está vazia", () => {
    const result = SocioEconomicSituation.create(
      1200,
      300,
      false,
      [],
      " ",
      false,
    );

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("SES-005");
  });
});
