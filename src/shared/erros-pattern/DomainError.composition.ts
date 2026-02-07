import type {
  DomainError,
  ErrorCategory,
  ObservabilitySeverityLevel,
  SpecificDomainError,
} from "./DomainError";
import { ErrorTaxonomy, ObservabilitySeverity } from "./DomainError";

/**
 * Função pura responsável por interpolar a mensagem do erro.
 */
export type Template = (ctx: Record<string, unknown>) => string;

const REDACTION_MASK = "***" as const;

/**
 * Entrada do catálogo de erros.
 */
export type CatalogEntry = {
  /** Código do erro (pode ser o sufixo se codePrefix for fornecido). */
  readonly code: string;
  readonly template: Template;
  readonly category: ErrorCategory;
  readonly severity?: ObservabilitySeverityLevel;
  readonly http?: number;
  readonly redact?: string[];
  readonly tags?: Record<string, string>;
};

export type Catalog<K extends string> = Record<K, CatalogEntry>;

export type MakeFactoryOptions<K extends string> = {
  /** Bounded context (ex: SOCIAL). */
  readonly bc: string;
  /** Módulo (ex: social-care/patient). */
  readonly module: string;
  readonly catalog: Catalog<K>;
  /** Prefixo opcional para os códigos (ex: PAT). Se fornecido, o código final será PREFIX-CODE. */
  readonly codePrefix?: string;
  /** Provedor de timestamp para o ID do erro. */
  readonly now?: () => Date;
  /** Redactor para mascarar campos sensíveis. */
  readonly redactor?: (key: string, value: unknown) => unknown;
};

/**
 * Formata data no padrão brasileiro (Fortaleza/UTC-3) para o ID do erro.
 */
const formatBrDate = (date: Date): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Fortaleza",
  })
    .format(date)
    .replace(", ", ":");
};

/**
 * Gera o ID descritivo padrão do projeto.
 */
const generateErrorId = (args: {
  bc: string;
  module: string;
  kind: string;
  now: Date;
}): string => {
  const time = formatBrDate(args.now);
  return `${args.bc}@${args.module}#${args.kind}-time:${time}-tz:America/Fortaleza(-03:00)`;
};

/**
 * Constrói o contexto seguro (mascarado).
 */
const buildSafeContext = (
  ctx: Record<string, unknown>,
  redactList: string[],
  redactor?: (key: string, value: unknown) => unknown,
): Record<string, unknown> => {
  const redactSet = new Set(redactList);
  const safeEntries = Object.entries(ctx).map(([key, value]) => {
    const transformed = redactor ? redactor(key, value) : value;
    const masked = redactSet.has(key) ? REDACTION_MASK : transformed;
    return [key, masked] as const;
  });
  return Object.fromEntries(safeEntries);
};

/**
 * Cria uma fábrica de erros de domínio funcional.
 *
 * @example
 * ```ts
 * const Errors = makeDomainErrorFactory({
 *   bc: "SOCIAL",
 *   module: "patient",
 *   codePrefix: "PAT",
 *   catalog: {
 *     NotFound: {
 *       code: "001",
 *       category: ErrorTaxonomy.DomainRuleViolation,
 *       template: ({ id }) => `Paciente ${id} não encontrado`
 *     }
 *   }
 * });
 * ```
 */
export function makeDomainErrorFactory<K extends string>(opts: MakeFactoryOptions<K>) {
  const { bc, module, catalog, redactor, codePrefix, now = () => new Date() } = opts;

  const helpers = Object.entries(catalog).reduce(
    (acc, [kind, entry]) => {
      const typedKind = kind as K;

      const createError = (
        ctx: Record<string, unknown> = {},
        extra: { cause?: unknown; stackTrace?: string } = {},
      ): SpecificDomainError<K> => {
        const generationTime = now();
        const message = entry.template(ctx).replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, key) => {
          const val = ctx[key];
          return val === null || val === undefined ? "∅" : String(val);
        });

        const id = generateErrorId({ bc, module, kind: typedKind, now: generationTime });

        const enrichedCtx = {
          ...ctx,
          tz: "America/Fortaleza",
          tz_offset: "-03:00",
          generated_at_br: formatBrDate(generationTime),
        };

        const severity = entry.severity ?? ObservabilitySeverity.Error;
        const fullCode = codePrefix && !entry.code.startsWith(codePrefix) 
          ? `${codePrefix}-${entry.code}` 
          : entry.code;

        return Object.freeze({
          id,
          code: fullCode,
          message,
          bc,
          module,
          kind: typedKind,
          context: Object.freeze(enrichedCtx),
          safeContext: Object.freeze(buildSafeContext(enrichedCtx, entry.redact ?? [], redactor)),
          http: entry.http,
          stackTrace: extra.stackTrace,
          cause: extra.cause,
          observability: Object.freeze({
            category: entry.category,
            severity,
            fingerprint: Object.freeze([bc, module, entry.category, typedKind]),
            tags: Object.freeze({
              bc,
              module,
              kind: typedKind,
              code: fullCode,
              category: entry.category,
              severity,
              ...(entry.tags ?? {}),
            }),
          }),
        }) as SpecificDomainError<K>;
      };

      return { ...acc, [typedKind]: createError };
    },
    {} as Record<
      K,
      (ctx?: Record<string, unknown>, extra?: { cause?: unknown; stackTrace?: string }) => SpecificDomainError<K>
    >,
  );

  return {
    ...helpers,
    // Exposing metadata for introspection/shortcuts/docs
    bc,
    module,
    catalog,
    /** Converte um DomainError em um payload amigável para respostas HTTP. */
    toHttp: (error: DomainError) => ({
      status: error.http ?? 400,
      body: {
        code: error.code,
        message: error.message,
        category: error.observability.category,
        severity: error.observability.severity,
        details: error.safeContext,
      },
    }),
    /** Converte um DomainError em um snapshot para ferramentas de telemetria. */
    toTelemetry: (error: DomainError) => ({
      ...error,
      fingerprint: error.observability.fingerprint,
      tags: error.observability.tags,
    }),
  };
}