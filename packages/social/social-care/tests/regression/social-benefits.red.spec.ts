import { describe, expect, test } from "bun:test";

import {
  BE,
  FamilyMemberId,
  SocialBenefit,
  SocialBenefitsCollection,
} from "@conecta/social-care";

const makeSocialBenefit = () =>
  SocialBenefit.create({
    benefitName: "Bolsa Família",
    amount: 600,
    beneficiaryId: FamilyMemberId.create().unwrap(),
  }).unwrap();

describe("SocialBenefit.copyWith — regressões", () => {
  test("não lança nem retorna ok quando beneficiaryId novo é inválido", () => {
    const benefit = makeSocialBenefit();
    const invalidBeneficiaryId = {
      value: "beneficiary-id-invalido",
    } as FamilyMemberId;

    const result = benefit.copyWith({
      beneficiaryId: invalidBeneficiaryId,
    });

    expect(result.isErr).toBe(true);
    if (!result.isErr) return;

    expect(result.unwrapErr().code).toBe(
      BE.BeneficiaryIdInvalid("beneficiary-id-invalido").code,
    );
  });
});

describe("SocialBenefitsCollection.create — regressões", () => {
  test("retorna Result.err quando payload recebido é null", () => {
    const result = SocialBenefitsCollection.create(
      null as unknown as SocialBenefit[],
    );

    expect(result.isErr).toBe(true);
  });
});
