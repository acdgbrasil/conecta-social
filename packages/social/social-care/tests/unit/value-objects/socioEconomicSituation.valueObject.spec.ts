import { describe, expect, test } from "bun:test";
import { SocioEconomicSituation, SocialBenefit, SocialBenefitsCollection } from "@conecta/social-care";
import { Uuid } from "@conecta/uuid";

const VALID_UUID = Uuid.create("123e4567-e89b-12d3-a456-426614174000").unwrap();

const makeBenefit = (name = "Benefício Família", amount = 150) => {
  return SocialBenefit.create({ benefitName: name, amount: amount, beneficiaryId: VALID_UUID }).unwrap();
};

const EMPTY_BENEFITS = SocialBenefitsCollection.create([]).unwrap();
const SINGLE_BENEFIT = SocialBenefitsCollection.create([makeBenefit()]).unwrap();

describe("SocioEconomicSituation.valueObject", () => {
  test("cria situação socioeconômica válida quando dados são consistentes", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: 1500,
      receivesSocialBenefit: true,
      socialBenefits: SINGLE_BENEFIT,
      mainSourceOfIncome: "Trabalho Formal",
      hasUnemployed: false
    });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    const situation = result.unwrap();
    expect(situation.receivesSocialBenefit).toBe(true);
    expect(situation.socialBenefits.count()).toBe(1);
  });

  test("retorna erro quando há benefícios mas flag indica que não recebe", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: 1500,
      receivesSocialBenefit: false, // Inconsistente
      socialBenefits: SINGLE_BENEFIT,
      mainSourceOfIncome: "Trabalho Formal",
      hasUnemployed: false
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe("SES-001");
  });

  test("retorna erro quando flag indica que recebe mas lista está vazia", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: 1500,
      receivesSocialBenefit: true, // Inconsistente
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: "Trabalho Formal",
      hasUnemployed: false
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe("SES-002");
  });

  test("retorna erro quando renda familiar total é negativa", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: -100,
      incomePerCapita: 1500,
      receivesSocialBenefit: false,
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: "Trabalho Formal",
      hasUnemployed: false
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe("SES-003");
  });

  test("retorna erro quando renda per capita é negativa", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: -50,
      receivesSocialBenefit: false,
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: "Trabalho Formal",
      hasUnemployed: false
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe("SES-004");
  });

  test("retorna erro quando fonte principal de renda está vazia", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: 1500,
      receivesSocialBenefit: false,
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: " ", // Vazio
      hasUnemployed: false
    });

    expect(result.isErr).toBe(true);
    expect(result.unwrapErr().code).toBe("SES-005");
  });
});
