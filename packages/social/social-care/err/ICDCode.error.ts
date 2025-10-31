import {
  ErrorTaxonomy,
  makeDomainErrorFactory,
  ObservabilitySeverity,
} from "@conecta/domain-error";
import { Template } from "@conecta/domain-error/DomainError.factory";

const ICD_PATTERN_WITH_OPTIONAL_DOT = "^[A-TV-Z]\\d{2}(?:\\.[A-Z0-9]{1,4}|[A-Z0-9]{0,4})$";
const ICD_PATTERN_WITH_DOT = "^[A-TV-Z]\\d{2}\\.[A-Z0-9]{1,4}$";

type ICDCodeErrorKind =
  | "INVALID_CID_NUMBER"
  | "EMPTY_CID_CODE"
  | "RETIRED_CID_CODE"
  | "ICD_CONTEXT_CONFLICT";

const template = (literal: string): Template => (ctx) =>
  literal.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = ctx[key];
    if (value === null || value === undefined) {
      return "∅";
    }
    return String(value);
  });

const ICDCodeErrorCatalog = {
  INVALID_CID_NUMBER: {
    code: "ICD-001",
    template: template(
      "Valor '{received}' não representa um CID válido. Candidato normalizado: '{candidate}'. Esperado padrão {expectedPattern}.",
    ),
    category: ErrorTaxonomy.DomainRuleViolation,
    severity: ObservabilitySeverity.Warning,
    http: 422,
    redact: ["received"],
    tags: { cause: "invalid_cid" },
  },
  EMPTY_CID_CODE: {
    code: "ICD-002",
    template: template("Nenhum CID foi informado para o campo '{field}'."),
    category: ErrorTaxonomy.DomainRuleViolation,
    severity: ObservabilitySeverity.Warning,
    http: 400,
    tags: { cause: "empty_value" },
  },
  RETIRED_CID_CODE: {
    code: "ICD-003",
    template: template(
      "O CID '{code}' está aposentado desde {retiredAt} e não pode ser atribuído.",
    ),
    category: ErrorTaxonomy.DomainRuleViolation,
    severity: ObservabilitySeverity.Warning,
    http: 409,
    tags: { cause: "retired_code" },
  },
  ICD_CONTEXT_CONFLICT: {
    code: "ICD-004",
    template: template(
      "O CID '{code}' não é válido para o contexto '{context}'.",
    ),
    category: ErrorTaxonomy.DomainRuleViolation,
    severity: ObservabilitySeverity.Error,
    http: 422,
    tags: { cause: "context_conflict" },
  },
} satisfies Record<
  ICDCodeErrorKind,
  {
    readonly code: string;
    readonly template: Template;
    readonly category: (typeof ErrorTaxonomy)[keyof typeof ErrorTaxonomy];
    readonly severity: (typeof ObservabilitySeverity)[keyof typeof ObservabilitySeverity];
    readonly http: number;
    readonly redact?: string[];
    readonly tags?: Readonly<Record<string, string>>;
  }
>;

const expectedPattern = (requireDot: boolean) =>
  requireDot ? ICD_PATTERN_WITH_DOT : ICD_PATTERN_WITH_OPTIONAL_DOT;

const factory = makeDomainErrorFactory<ICDCodeErrorKind>({
  bc: "SOCIAL",
  module: "social-care/icd-code",
  catalog: ICDCodeErrorCatalog,
  codePrefix: "ICD",
});

/**
 * Gera um erro de domínio descritivo para valores que não correspondem ao formato CID.
 *
 * @example
 * ```ts
 * throw ICDError.InvalidCidNumber("A0", "A00.0", { requireDot: false });
 * ```
 */
const invalidCidNumber = (
  received: string,
  candidate: string,
  options: { requireDot?: boolean; autoDot?: boolean } = {},
  cause?: unknown,
) =>
  factory.INVALID_CID_NUMBER(
    {
      received,
      candidate,
      requireDot: options.requireDot ?? false,
      autoDot: options.autoDot ?? true,
      expectedPattern: expectedPattern(options.requireDot ?? false),
    },
    { cause },
  );


/**
 * Indica que nenhum CID foi informado em um campo obrigatório.
 */
const emptyCidCode = (field = "icdCode", cause?: unknown) =>
  factory.EMPTY_CID_CODE(
    { field },
    { cause },
  );

/**
 * Sinaliza que um CID foi aposentado e não deve mais ser utilizado.
 */
const retiredCidCode = (
  code: string,
  retiredAt: string,
  cause?: unknown,
) =>
  factory.RETIRED_CID_CODE(
    { code, retiredAt },
    { cause },
  );


/**
 * Erro disparado quando um CID não é aplicável para um determinado contexto clínico.
 */
const contextConflict = (
  code: string,
  context: string,
  cause?: unknown,
) =>
  factory.ICD_CONTEXT_CONFLICT(
    { code, context },
    { cause },
  );

/**
 * Coleção de helpers nomeados para construir erros de domínio relacionados a CID
 * com semântica explícita e integrados ao pipeline de observabilidade.
 */
export const ICDError = {
  InvalidCidNumber: invalidCidNumber,
  EmptyCidCode: emptyCidCode,
  RetiredCidCode: retiredCidCode,
  ContextConflict: contextConflict,
  toHttp: factory.toHttp,
  toTelemetry: factory.toTelemetry,
  catalog: factory.catalog,
  bc: factory.bc,
  module: factory.module,
} as const;

export type ICDErrorFactory = typeof ICDError;
