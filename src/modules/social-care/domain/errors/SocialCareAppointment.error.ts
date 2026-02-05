import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type SocialCareAppointmentErrorKind =
  | "DateInFuture"
  | "MissingNarrative"
  | "SummaryTooLong"
  | "ActionPlanTooLong";

export const SocialCareAppointmentErrors =
  makeDomainErrorFactory<SocialCareAppointmentErrorKind>({
    bc: "SOCIAL",
    module: "social-care/appointment",
    codePrefix: "SCA",
    catalog: {
      DateInFuture: {
        code: "SCA-001",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "A data do atendimento não pode estar no futuro em relação ao contexto fornecido.",
      },
      MissingNarrative: {
        code: "SCA-002",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: () =>
          "É necessário informar ao menos resumo ou plano de ação para o atendimento.",
      },
      SummaryTooLong: {
        code: "SCA-003",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ limit }) =>
          `O resumo do atendimento não pode exceder ${limit} caracteres.`,
      },
      ActionPlanTooLong: {
        code: "SCA-004",
        http: 422,
        category: ErrorTaxonomy.DomainRuleViolation,
        template: ({ limit }) =>
          `O plano de ação não pode exceder ${limit} caracteres.`,
      },
    },
  });

export const SCAE = shortcuts(SocialCareAppointmentErrors, {
  DateInFuture: [] as const,
  MissingNarrative: [] as const,
  SummaryTooLong: ["limit"] as const,
  ActionPlanTooLong: ["limit"] as const,
});
