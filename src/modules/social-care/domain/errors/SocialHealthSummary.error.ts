import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type SocialHealthSummaryKind = "FunctionalDependenciesEmpty";

export const SocialHealthSummaryErrors =
  makeDomainErrorFactory<SocialHealthSummaryKind>({
    bc: "SOCIAL",
    module: "social-care/social-health-summary",
    codePrefix: "SHS",
    catalog: {
      FunctionalDependenciesEmpty: {
        code: "SHS-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "A lista de dependências funcionais não pode estar vazia.",
      },
    },
  });

export const SHSDE = shortcuts(SocialHealthSummaryErrors, {
  FunctionalDependenciesEmpty: [] as const,
});
