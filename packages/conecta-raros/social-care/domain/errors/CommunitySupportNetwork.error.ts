import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type CommunitySupportNetworkErrorKind = "FamilyConflictsWhitespace" | "FamilyConflictsTooLong";

export const CommunitySupportNetworkErrors =
  makeDomainErrorFactory<CommunitySupportNetworkErrorKind>({
    bc: "SOCIAL",
    module: "social-care/community-support-network",
    codePrefix: "CSN",
    catalog: {
      FamilyConflictsWhitespace: {
        code: "CSN-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "O campo de conflitos familiares não pode conter apenas espaços em branco.",
      },
      FamilyConflictsTooLong: {
        code: "CSN-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "O campo de conflitos familiares não pode ter mais de 300 caracteres.",
      }
    },
  });

export const CSN = shortcuts(CommunitySupportNetworkErrors, {
  FamilyConflictsWhitespace: [] as const,
  FamilyConflictsTooLong: [] as const,
});
