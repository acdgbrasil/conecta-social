import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

// 1) Tipos
export type SocioEconomicSituationKind =
  | "InconsistentSocialBenefit"
  | "MissingSocialBenefits"
  | "NegativeFamilyIncome"
  | "NegativeIncomePerCapita"
  | "EmptyMainSourceOfIncome"
  | "InconsistentIncomePerCapita";

// 2) Catálogo
export const SocioEconomicSituationErrors =
  makeDomainErrorFactory<SocioEconomicSituationKind>({
    bc: "SOCIAL",
    module: "social-care/socio-economic-situation",
    codePrefix: "SES",
    catalog: {
      InconsistentSocialBenefit: {
        code: "SES-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "Receber benefício social não pode ser falso enquanto há benefícios sociais listados.",
      },
      MissingSocialBenefits: {
        code: "SES-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "Receber benefício social não pode ser verdadeiro enquanto não há benefícios sociais listados.",
      },
      NegativeFamilyIncome: {
        code: "SES-003",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ totalFamilyIncome }) =>
          `A renda familiar total (${totalFamilyIncome}) não pode ser negativa.`,
      },
      NegativeIncomePerCapita: {
        code: "SES-004",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ incomePerCapita }) =>
          `A renda per capita (${incomePerCapita}) não pode ser negativa.`,
      },
      EmptyMainSourceOfIncome: {
        code: "SES-005",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () => "A principal fonte de renda não pode estar vazia.",
      },
      InconsistentIncomePerCapita: {
        code: "SES-006",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ incomePerCapita, totalFamilyIncome }) =>
          `A renda per capita (${incomePerCapita}) não pode ser maior que a renda familiar total (${totalFamilyIncome}).`,
      },
    },
  });

// 3) Atalhos
export const SES = shortcuts(SocioEconomicSituationErrors, {
  InconsistentSocialBenefit: [] as const,
  MissingSocialBenefits: [] as const,
  NegativeFamilyIncome: ["totalFamilyIncome"] as const,
  NegativeIncomePerCapita: ["incomePerCapita"] as const,
  EmptyMainSourceOfIncome: [] as const,
  InconsistentIncomePerCapita: [
    "incomePerCapita",
    "totalFamilyIncome",
  ] as const,
});
