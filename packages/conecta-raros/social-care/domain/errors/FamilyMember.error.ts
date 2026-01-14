import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type FamilyMemberErrorKind = "MissingPerson" | "InvalidRelationship";

export const FamilyMemberErrors = makeDomainErrorFactory<FamilyMemberErrorKind>(
  {
    bc: "SOCIAL",
    module: "social-care/family-member",
    codePrefix: "FM",
    catalog: {
      MissingPerson: {
        code: "FM-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "Um membro da família precisa estar associado a uma pessoa válida.",
      },
      InvalidRelationship: {
        code: "FM-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "O relacionamento informado para o membro da família é inválido.",
      },
    },
  },
);

export const FM = shortcuts(FamilyMemberErrors, {
  MissingPerson: [] as const,
  InvalidRelationship: [] as const,
});
