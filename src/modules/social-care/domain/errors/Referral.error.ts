import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  shortcuts,
} from "@conecta/domain-error";

type ReferralErrorKind =
  | "DateInFuture"
  | "ReasonMissing"
  | "InvalidStatusTransition"
  | "InvalidDestinationService";

export const ReferralErrors = makeDomainErrorFactory<ReferralErrorKind>({
  bc: "SOCIAL",
  module: "social-care/referral",
  codePrefix: "REF",
  catalog: {
    DateInFuture: {
      code: "REF-001",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "A data do encaminhamento não pode estar no futuro.",
    },
    ReasonMissing: {
      code: "REF-002",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: () => "O motivo do encaminhamento é obrigatório.",
    },
    InvalidStatusTransition: {
      code: "REF-003",
      http: 409,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ from, to }) =>
        `Não é permitido mover o encaminhamento de ${from} para ${to}.`,
    },
    InvalidDestinationService: {
      code: "REF-004",
      http: 422,
      category: ErrorTaxonomy.DomainRuleViolation,
      template: ({ service, allowed }) =>
        `Serviço de destino inválido: ${service}. Valores permitidos: ${allowed}.`,
    },
  },
});

export const RE = shortcuts(ReferralErrors, {
  DateInFuture: [] as const,
  ReasonMissing: [] as const,
  InvalidStatusTransition: ["from", "to"] as const,
  InvalidDestinationService: ["service", "allowed"] as const,
});
