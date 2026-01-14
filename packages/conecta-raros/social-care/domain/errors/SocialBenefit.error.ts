import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

// 1) Tipos
export type SocialBenefitKind =
  | "BenefitNameEmpty"
  | "AmountInvalid"
  | "BeneficiaryIdInvalid";

// 2) Catálogo
export const SocialBenefitErrors = makeDomainErrorFactory<SocialBenefitKind>({
  bc: "SOCIAL",
  module: "social-care/social-benefit",
  codePrefix: "BENEFIT",
  catalog: {
    BenefitNameEmpty: {
      code: "BENEFIT-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "O nome do benefício não pode ser vazio.",
    },
    AmountInvalid: {
      code: "BENEFIT-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ amount }) =>
        `O valor do benefício (${amount}) deve ser maior que zero.`,
    },
    BeneficiaryIdInvalid: {
      code: "BENEFIT-003",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ beneficiaryId }) =>
        `O ID do beneficiário (${beneficiaryId}) é inválido.`,
    },
  },
});

// 3) Atalhos
export const BE = shortcuts(SocialBenefitErrors, {
  BenefitNameEmpty: [] as const,
  AmountInvalid: ["amount"] as const,
  BeneficiaryIdInvalid: ["beneficiaryId"] as const,
});
