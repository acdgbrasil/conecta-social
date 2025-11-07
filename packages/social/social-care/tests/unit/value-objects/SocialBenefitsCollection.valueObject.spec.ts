import { describe, expect, test } from "bun:test";
import { FamilyMemberId, SocialBenefit, SocialBenefitsCollection } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

const internId = Uuid.create("01890e18-257b-7b32-b264-93c9d46242ab").unwrap()
const BENEFICIARY_ID = FamilyMemberId.create(internId.value).unwrap();

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

  test("permite criar coleção vazia", () => {
    const result = SocialBenefitsCollection.create([]);

    expect(result.isOk).toBe(true);
    expect(result.unwrap().isEmpty()).toBe(true);
  });

  test("calcula o valor total dos benefícios na coleção", () => {
    const benefit1 = makeBenefit({ name: "Auxílio Alimentação", amount: 200 });
    const benefit2 = makeBenefit({ name: "Auxílio Transporte", amount: 100 });

    const collectionResult = SocialBenefitsCollection.create([benefit1, benefit2]);

    expect(collectionResult.isOk).toBe(true);
    const collection = collectionResult.unwrap();
    expect(collection.getTotalAmount()).toBe(300);
  });

  test("permite copiar a coleção com modificações", () => {
    const benefit1 = makeBenefit({ name: "Auxílio Saúde", amount: 250 });
    const collectionResult = SocialBenefitsCollection.create([benefit1]);

    expect(collectionResult.isOk).toBe(true);
    const collection = collectionResult.unwrap();

    const benefit2 = makeBenefit({ name: "Auxílio Educação", amount: 150 });
    const newCollectionResult = collection.copyWith({ items: [benefit1, benefit2] });

    expect(newCollectionResult.isOk).toBe(true);
    const newCollection = newCollectionResult.unwrap();
    expect(newCollection.count()).toBe(2);
    expect(newCollection.getTotalAmount()).toBe(400);
  });
});