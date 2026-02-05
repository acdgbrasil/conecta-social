import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type RightsViolationReportErrorKind =
  | "ReportDateInFuture"
  | "IncidentAfterReport"
  | "EmptyDescription";

export const RightsViolationReportErrors =
  makeDomainErrorFactory<RightsViolationReportErrorKind>({
    bc: "SOCIAL",
    module: "social-care/rights-violation-report",
    codePrefix: "RVR",
    catalog: {
      ReportDateInFuture: {
        code: "RVR-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () => "A data do relato não pode estar no futuro.",
      },
      IncidentAfterReport: {
        code: "RVR-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "A data do incidente não pode ser posterior à data do relato.",
      },
      EmptyDescription: {
        code: "RVR-003",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () => "A descrição do fato é obrigatória.",
      },
    },
  });

export const RVR = shortcuts(RightsViolationReportErrors, {
  ReportDateInFuture: [] as const,
  IncidentAfterReport: [] as const,
  EmptyDescription: [] as const,
});
