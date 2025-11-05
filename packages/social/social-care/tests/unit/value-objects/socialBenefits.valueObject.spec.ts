import { describe, expect, test } from "bun:test";
import { FamilyMemberId, SocialBenefit } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

const VALID_UUID_RESULT = Uuid.create("123e4567-e89b-12d3-a456-426614174000");
if (VALID_UUID_RESULT.isErr) throw new Error("UUID Válido de teste falhou ao criar");
const VALID_UUID = VALID_UUID_RESULT.unwrap();


describe("SocialBenefit.valueObject", () => {
  test("cria benefício social válido com dados corretos", () => {
    const result = SocialBenefit.create({ benefitName: "Benefício Família", amount: 250, beneficiaryId: VALID_UUID });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const benefit = result.unwrap();
    expect(benefit.benefitName).toBe("Benefício Família");
    expect(benefit.amount).toBe(250);
    expect(benefit.beneficiaryId).toBe(VALID_UUID.toString());
    expect(Object.isFrozen(benefit)).toBe(true);
  });

  test("retorna erro quando nome está vazio", () => {
    const result = SocialBenefit.create({ benefitName: " ", amount: 250, beneficiaryId: VALID_UUID });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("BENEFIT-001");
  });

  test("retorna erro quando valor é menor ou igual a zero", () => {
    const result = SocialBenefit.create({ benefitName: "Benefício Família", amount: 0, beneficiaryId: VALID_UUID });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.code).toBe("BENEFIT-002");
  });

  test("retorna erro quando UUID do beneficiário é inválido", () => {
    const result = Uuid.create("uuid-inválido");

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.error.name).toBe("InvalidUuidError");
  });

  test("normaliza nome do benefício removendo espaços excedentes", () => {
    const beneficiaryId = FamilyMemberId.create("01890e18-257b-7b32-b264-93c9d46242ab").unwrap();
    const result = SocialBenefit.create({
      benefitName: "   Programa de Renda   ",
      amount: 180,
      beneficiaryId,
    });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().benefitName).toBe("Programa de Renda");
  });

  test("permite alterar o beneficiário via copyWith", () => {
    const originalBeneficiary = FamilyMemberId.create("01890e18-257b-7b32-b264-93c9d46242ab").unwrap();
    const updatedBeneficiary = FamilyMemberId.create("01890e18-257b-7b32-b264-93c9d46242ac").unwrap();

    const benefit = SocialBenefit.create({
      benefitName: "Programa de Renda",
      amount: 200,
      beneficiaryId: originalBeneficiary,
    }).unwrap();

    const updated = benefit.copyWith({ beneficiaryId: updatedBeneficiary });

    expect(updated.isOk).toBe(true);
    if (!updated.isOk) return;

    expect(updated.unwrap().beneficiaryId).toBe(updatedBeneficiary.toString());
  });
});
