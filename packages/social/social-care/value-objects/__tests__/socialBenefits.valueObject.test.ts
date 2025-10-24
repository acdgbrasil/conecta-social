import { describe, expect, test } from "bun:test";
import { SocialBenefit } from "../socialBenefits.valueObjects";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("SocialBenefit.valueObject", () => {
  test("cria benefício social válido com dados corretos", () => {
    const result = SocialBenefit.create("Benefício Família", 250, VALID_UUID);

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const benefit = result.unwrap();
    expect(benefit.benefitName).toBe("Benefício Família");
    expect(benefit.amount).toBe(250);
    expect(benefit.beneficiaryId).toBe(VALID_UUID);
    expect(Object.isFrozen(benefit)).toBe(true);
  });

  test("retorna erro quando nome está vazio", () => {
    const result = SocialBenefit.create(" ", 250, VALID_UUID);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("BENEFIT-001");
  });

  test("retorna erro quando valor é menor ou igual a zero", () => {
    const result = SocialBenefit.create("Benefício Família", 0, VALID_UUID);

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("BENEFIT-002");
  });

  test("retorna erro quando UUID do beneficiário é inválido", () => {
    const result = SocialBenefit.create("Benefício Família", 250, "uuid-inválido");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("BENEFIT-003");
  });
});
