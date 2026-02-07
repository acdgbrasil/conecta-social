import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  ObservabilitySeverity,
  shortcuts,
} from "@conecta/domain-error";

type ICDCodeErrorKind =
  | "INVALID_CID_NUMBER"
  | "EMPTY_CID_CODE"
  | "RETIRED_CID_CODE"
  | "ICD_CONTEXT_CONFLICT";

const factory = makeDomainErrorFactory<ICDCodeErrorKind>({
  bc: "SOCIAL",
  module: "social-care/icd-code",
  codePrefix: "ICD",
  catalog: {
    INVALID_CID_NUMBER: {
      code: "001",
      template: () => "Valor '{received}' não representa um CID válido. Candidato normalizado: '{candidate}'. Esperado padrão {expectedPattern}.",
      category: ErrorTaxonomy.DomainRuleViolation,
      severity: ObservabilitySeverity.Warning,
      http: 422,
      redact: ["received"],
    },
    EMPTY_CID_CODE: {
      code: "002",
      template: () => "Nenhum CID foi informado para o campo '{field}'.",
      category: ErrorTaxonomy.DomainRuleViolation,
      severity: ObservabilitySeverity.Warning,
      http: 400,
    },
    RETIRED_CID_CODE: {
      code: "003",
      template: () => "O CID '{code}' está aposentado desde {retiredAt} e não pode ser atribuído.",
      category: ErrorTaxonomy.DomainRuleViolation,
      severity: ObservabilitySeverity.Warning,
      http: 409,
    },
    ICD_CONTEXT_CONFLICT: {
      code: "004",
      template: () => "O CID '{code}' não é válido para o contexto '{context}'.",
      category: ErrorTaxonomy.DomainRuleViolation,
      severity: ObservabilitySeverity.Error,
      http: 422,
    },
  },
});

/**
 * Coleção de helpers funcionais para erros de CID.
 */
export const ICDError = {
  // Factories puras do catálogo
  InvalidCidNumber: factory.INVALID_CID_NUMBER,
  EmptyCidCode: factory.EMPTY_CID_CODE,
  RetiredCidCode: factory.RETIRED_CID_CODE,
  ContextConflict: factory.ICD_CONTEXT_CONFLICT,
  
  // Shortcuts posicionais (opcional, mas mantendo compatibilidade com o padrão)
  ...shortcuts(factory, {
    INVALID_CID_NUMBER: ["received", "candidate", "expectedPattern"],
    EMPTY_CID_CODE: ["field"],
    RETIRED_CID_CODE: ["code", "retiredAt"],
    ICD_CONTEXT_CONFLICT: ["code", "context"],
  }),

  toHttp: factory.toHttp,
  toTelemetry: factory.toTelemetry,
  catalog: factory.catalog,
  bc: factory.bc,
  module: factory.module,
} as const;