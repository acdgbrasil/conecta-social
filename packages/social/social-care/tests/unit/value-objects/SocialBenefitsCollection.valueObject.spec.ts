import { describe, expect, test } from "bun:test";
import { SocialBenefit, SocialBenefitsCollection } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

const BENEFICIARY_ID = Uuid.create("01890e18-257b-7b32-b264-93c9d46242ab").unwrap();

const makeBenefit = (overrides?: Partial<{ name: string; amount: number }>) => {
  const result = SocialBenefit.create({
    benefitName: overrides?.name ?? "Auxílio Moradia",
    amount: overrides?.amount ?? 150,
    beneficiaryId: BENEFICIARY_ID,
  });

  if (!result.isOk) {
    throw result.error;
  }

  return result.unwrap();
};

describe("SocialBenefitsCollection.valueObject (RED tests)", () => {
  test("impede inserir o mesmo benefício duas vezes para o mesmo beneficiário", () => {
    const benefit = makeBenefit();
    const result = SocialBenefitsCollection.create([benefit, benefit]);

    expect(result.isErr).toBe(true);
  });

  test("calcula valor total ignorando benefícios duplicados", () => {
    const benefit = makeBenefit({ amount: 200 });
    const duplicate = makeBenefit({ amount: 200 });

    const collection = SocialBenefitsCollection.create([benefit, duplicate]);
    expect(collection.isOk).toBe(true);
    if (!collection.isOk) return;

    expect(collection.unwrap().getTotalAmount()).toBe(200);
  });
});
