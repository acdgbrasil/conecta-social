import { describe, expect, test } from "bun:test";
import { SocioEconomicSituation, SocialBenefit, SocialBenefitsCollection, FamilyMemberId, SES } from "packages/conecta-raros/social-care";

const VALID_UUID = FamilyMemberId.create("018f0b9c-5b5a-7b1e-9b0a-0e1f2c3d4e5f").unwrap();

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

  test("impede renda per capita maior do que a renda familiar total", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 1000,
      incomePerCapita: 1500,
      receivesSocialBenefit: false,
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: "Trabalho",
      hasUnemployed: false,
    });

    expect(result.isErr).toBe(true);
  });

  test("normaliza a fonte principal de renda removendo espaços excedentes", () => {
    const result = SocioEconomicSituation.create({
      totalFamilyIncome: 3000,
      incomePerCapita: 1000,
      receivesSocialBenefit: false,
      socialBenefits: EMPTY_BENEFITS,
      mainSourceOfIncome: "   Trabalho informal   ",
      hasUnemployed: false,
    });

    expect(result.isOk).toBe(true);
    if (!result.isOk) return;

    expect(result.unwrap().mainSourceOfIncome).toBe("Trabalho informal");
  });
});


describe("copyWith", () => {
    // Helpers do seu arquivo de teste
    const makeBenefit = (name = "Benefício Família", amount = 150) => {
      return SocialBenefit.create({ benefitName: name, amount: amount, beneficiaryId: VALID_UUID }).unwrap();
    };
    const SINGLE_BENEFIT = SocialBenefitsCollection.create([makeBenefit()]).unwrap();

    const makeSituation = (props = {}) => {
      const validProps = {
        totalFamilyIncome: 3000,
        incomePerCapita: 1500,
        receivesSocialBenefit: true,
        socialBenefits: SINGLE_BENEFIT,
        mainSourceOfIncome: "Trabalho Formal",
        hasUnemployed: false,
        ...props,
      };
      return SocioEconomicSituation.create(validProps).unwrap();
    };

    test("deve falhar se (receivesSocialBenefit=false) mas lista de benefícios não está vazia", () => {
      const original = makeSituation({ 
        receivesSocialBenefit: true, 
        socialBenefits: SINGLE_BENEFIT 
      });

      // Tenta atualizar a flag para false, mas "esquece" de limpar a lista
      const result = original.copyWith({ receivesSocialBenefit: false });

      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(SES.InconsistentSocialBenefit().code); // "SES-001"
    });

    test("deve falhar se (receivesSocialBenefit=true) mas a nova lista está vazia", () => {
      const EMPTY_BENEFITS = SocialBenefitsCollection.create([]).unwrap();
      const original = makeSituation({
        receivesSocialBenefit: false,
        socialBenefits: EMPTY_BENEFITS
      });

      // Tenta atualizar a flag para true, mas "esquece" de adicionar benefícios
      const result = original.copyWith({ receivesSocialBenefit: true });
      
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(SES.MissingSocialBenefits().code); // "SES-002"
    });

    test("deve falhar a revalidação se a renda familiar for negativa", () => {
      const original = makeSituation();
      const result = original.copyWith({ totalFamilyIncome: -100 });
      
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(SES.NegativeFamilyIncome(original.totalFamilyIncome).code); // "SES-003"
    });

    test("deve falhar a revalidação se a renda per capita for negativa", () => {
      const original = makeSituation();
      const result = original.copyWith({ incomePerCapita: -50 });
      
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr().code).toBe(SES.NegativeIncomePerCapita(original.incomePerCapita).code); // "SES-004"
    });

    test("deve aplicar trim na fonte de renda", () => {
      const original = makeSituation();
      const result = original.copyWith({ mainSourceOfIncome: "  Autônomo  " });
      
      expect(result.isOk).toBe(true);
      expect(result.unwrap().mainSourceOfIncome).toBe("Autônomo");
    });
  });
