import { describe, expect, test } from "bun:test";
import { BE } from "@conecta/social-care";

describe("SocialBenefit errors", () => {
  test("BenefitNameEmpty usa mensagem padrão quando campo está em branco", () => {
    const error = BE.BenefitNameEmpty();

    expect(error.code).toBe("BENEFIT-001");
    expect(error.message).toBe("O nome do benefício não pode ser vazio.");
  });

  test("AmountInvalid inclui o valor informado na mensagem", () => {
    const error = BE.AmountInvalid(0);

    expect(error.code).toBe("BENEFIT-002");
    expect(error.message).toContain("(0)");
    expect(error.context.amount).toBe(0);
  });

  test("BeneficiaryIdInvalid inclui o identificador inválido na mensagem", () => {
    const error = BE.BeneficiaryIdInvalid("beneficiary-xyz");

    expect(error.code).toBe("BENEFIT-003");
    expect(error.message).toContain("beneficiary-xyz");
    expect(error.context.beneficiaryId).toBe("beneficiary-xyz");
  });
});
