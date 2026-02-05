import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

// 1) Tipos
export type SocialBenefitsCollectionErrorKind =
  | "DuplicateBenefitNotAllowed"
  | "BenefitsArrayNullOrUndefined";

// 2) Catálogo
export const SocialBenefitsCollectionErrors =
  makeDomainErrorFactory<SocialBenefitsCollectionErrorKind>({
    bc: "SOCIAL",
    module: "social-care/social-benefits-collection",
    codePrefix: "COLLECTION",
    catalog: {
      DuplicateBenefitNotAllowed: {
        code: "COLLECTION-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ benefitName }) =>
          `Não é permitido inserir o benefício duplicado (${benefitName}) na coleção.`,
      },
      BenefitsArrayNullOrUndefined: {
        code: "COLLECTION-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          `O array de benefícios não pode ser nulo ou indefinido.`,
      },
    },
  });

// 3) Atalhos
export const SBC = shortcuts(SocialBenefitsCollectionErrors, {
  DuplicateBenefitNotAllowed: ["benefitName"] as const,
  BenefitsArrayNullOrUndefined: [] as const,
});
