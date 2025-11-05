// shared-kernel (já existe): DomainError + DomainErrorFactory
// Aqui adicionamos a ideia de catálogo e helpers (composição).

import { SpecificDomainError } from "./DomainError";
import { DomainErrorFactory } from "./DomainError.factory";

/**
 * Taxonomia de categorias observáveis para classificar incidentes.
 */
export const ErrorTaxonomy = {
  /** Regras de negócio violadas dentro do domínio. */
  DomainRuleViolation: "DOMAIN_RULE_VIOLATION",
  /** Falhas provenientes de APIs de terceiros ou integrações externas. */
  ExternalApiFailure: "EXTERNAL_API_FAILURE",
  /** Falhas de contrato ao consumir payloads externos. */
  ExternalContractMismatch: "EXTERNAL_CONTRACT_MISMATCH",
  /** Problemas de comunicação entre camadas internas (ex: application ↔ infra). */
  CrossLayerCommunication: "CROSS_LAYER_COMMUNICATION_FAILURE",
  /** Inconsistências detectadas na camada de persistência ou caches. */
  DataConsistencyIncident: "DATA_CONSISTENCY_INCIDENT",
  /** Quebras de política de segurança ou violações de acesso. */
  SecurityBoundaryViolation: "SECURITY_BOUNDARY_VIOLATION",
  /** Serviços de infraestrutura indisponíveis (ex: fila, broker, storage). */
  InfrastructureDependencyFailure: "INFRASTRUCTURE_DEPENDENCY_FAILURE",
  /** Falhas na própria tubulação de observabilidade (logs, métricas, tracing). */
  ObservabilityPipelineFailure: "OBSERVABILITY_PIPELINE_FAILURE",
  /** Estado inesperado que não deveria acontecer em execução normal. */
  UnexpectedSystemState: "UNEXPECTED_SYSTEM_STATE",
} as const;

/**
 * Níveis de severidade alinhados aos sinais de observabilidade.
 */
export const ObservabilitySeverity = {
  Debug: "DEBUG",
  Info: "INFO",
  Warning: "WARNING",
  Error: "ERROR",
  Critical: "CRITICAL",
} as const;

/**
 * Categoria semântica do erro gerada para observabilidade.
 */
export type ErrorCategory = (typeof ErrorTaxonomy)[keyof typeof ErrorTaxonomy];

/**
 * Severidade do incidente gerada para observabilidade.
 */
export type ObservabilitySeverityLevel =
  (typeof ObservabilitySeverity)[keyof typeof ObservabilitySeverity];

/**
 * Descreve uma função pura responsável por interpolar a mensagem do erro
 * de domínio com base em um contexto arbitrário.
 */
export type Template = (ctx: Record<string, unknown>) => string;

/**
 * Define os metadados que devem ser fornecidos para cada erro do catálogo.
 */
type CatalogEntry = {
  /** Código completo no padrão PREFIXO-IDENTIFICADOR (ex: PAT-CPF-001). */
  code: string;
  /** Função de template para construir a mensagem final. */
  template: Template;
  /** Categoria observável que melhor descreve a natureza do incidente. */
  category: ErrorCategory;
  /** Severidade recomendada para o incidente. */
  severity?: ObservabilitySeverityLevel;
  /** Mapeamento opcional para status HTTP. */
  http?: number;
  /** Lista de chaves do contexto que devem ser mascaradas no safeContext. */
  redact?: string[];
  /** Tags adicionais para enriquecer métricas, logs e traces. */
  tags?: Readonly<Record<string, string>>;
};

/**
 * Coleção tipada de erros possíveis identificados pela chave literal `K`.
 */
type Catalog<K extends string> = Record<K, CatalogEntry>;

/**
 * Função responsável por fornecer a data utilizada na criação do erro.
 */
type TimestampProvider = () => Date;

/**
 * Função que permite customizar a redação de campos sensíveis no contexto.
 */
type ContextRedactor = (key: string, value: unknown) => unknown;

/**
 * Representa o erro de domínio enriquecido pelos dados fornecidos nesta composição.
 */
type ObservabilityMetadata = {
  /** Categoria analítica para dashboards e correlação. */
  readonly category: ErrorCategory;
  /** Severidade do incidente sob perspectiva operacional. */
  readonly severity: ObservabilitySeverityLevel;
  /** Fingerprint estável que agrupa o incidente em agregações. */
  readonly fingerprint: ReadonlyArray<string>;
  /** Conjunto de tags arbitrárias para logs/métricas. */
  readonly tags: Readonly<Record<string, string>>;
};

type ComposedDomainError<K extends string> = SpecificDomainError<K> & {
  readonly http?: number;
  readonly safeContext: Readonly<Record<string, unknown>>;
  readonly observability: ObservabilityMetadata;
};

/**
 * Snapshot padronizado para transportar dados de observabilidade.
 */
type TelemetrySnapshot<K extends string> = {
  readonly bc: string;
  readonly module: string;
  readonly kind: K;
  readonly id: string;
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly severity: ObservabilitySeverityLevel;
  readonly fingerprint: ReadonlyArray<string>;
  readonly tags: Readonly<Record<string, string>>;
  readonly safeContext: Readonly<Record<string, unknown>>;
  readonly context: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;
};

/**
 * Parâmetros aceitos por {@link makeDomainErrorFactory}.
 *
 * @template K Identificadores literais das categorias de erro.
 */
type MakeFactoryOptions<K extends string> = {
  /** Bounded context responsável pelo erro. */
  bc: string;
  /** Módulo ou subdomínio que originou o erro. */
  module: string;
  /** Catálogo completo dos erros suportados. */
  catalog: Catalog<K>;
  /**
   * Fornece a data utilizada ao gerar um erro. Útil para testes determinísticos.
   * Caso omitido, `new Date()` será utilizado.
   */
  now?: TimestampProvider;
  /**
   * Redactor opcional para transformar valores sensíveis antes da exposição.
   * É aplicado antes da lógica de mascaramento via `redact`.
   */
  redactor?: ContextRedactor;
  /**
   * Permite definir explicitamente o prefixo utilizado para compor o código.
   * Caso omitido, o valor é inferido a partir do catálogo.
   */
  codePrefix?: string;
};

const REDACTION_MASK = "***" as const;
const EMPTY_SAFE_CONTEXT = Object.freeze({}) as Readonly<Record<string, unknown>>;

/**
 * Resultado da normalização do catálogo, contendo o prefixo inferido e o mapa de specs
 * esperado pela {@link DomainErrorFactory}.
 */
type NormalizedCatalog<K extends string> = {
  readonly codePrefix: string;
  readonly specs: Readonly<Record<K, readonly [string, Template]>>;
};

/**
 * Garante que cada entrada do catálogo está no formato esperado pela fábrica de baixo nível.
 *
 * @throws {Error} Quando não é possível inferir ou manter um prefixo único.
 */
function normalizeCatalog<K extends string>(
  catalog: Catalog<K>,
  forcedPrefix?: string,
): NormalizedCatalog<K> {
  const initialPrefix = forcedPrefix ?? null;

  const { codePrefix, specs } = (Object.entries(catalog) as [K, CatalogEntry][]).reduce(
    (state, [kind, entry]) => {
      const existingPrefix = state.codePrefix ?? initialPrefix;
      const nextPrefix =
        existingPrefix ??
        (() => {
          const separatorIndex = entry.code.lastIndexOf("-");
          if (separatorIndex <= 0 || separatorIndex === entry.code.length - 1) {
            throw new Error(
              `Catálogo de erros: impossível inferir prefixo para '${kind}' com código '${entry.code}'.`,
            );
          }
          return entry.code.slice(0, separatorIndex);
        })();

      if (entry.code.startsWith(`${nextPrefix}-`) === false && existingPrefix) {
        throw new Error(
          `Catálogo de erros: prefixo inconsistente. Esperado '${existingPrefix}', recebido '${entry.code}'.`,
        );
      }

      const shortCode = entry.code.replace(`${nextPrefix}-`, "");
      if (!shortCode) {
        throw new Error(
          `Catálogo de erros: shortCode vazio para '${kind}'. Verifique o código '${entry.code}'.`,
        );
      }

      return {
        codePrefix: nextPrefix,
        specs: {
          ...state.specs,
          [kind]: [shortCode, entry.template] as const,
        },
      };
    },
    {
      codePrefix: initialPrefix,
      specs: {} as Record<K, readonly [string, Template]>,
    },
  );

  if (!codePrefix) {
    throw new Error(
      "Catálogo de erros: não foi possível deduzir o codePrefix. Defina 'codePrefix' nas opções.",
    );
  }

  return {
    codePrefix,
    specs,
  };
}

/**
 * Constrói um contexto seguro para logs externos removendo ou mascarando valores sensíveis.
 */
function buildSafeContext(
  ctx: Record<string, unknown>,
  entry: CatalogEntry,
  redactor?: ContextRedactor,
): Readonly<Record<string, unknown>> {
  const redactList = new Set(entry.redact ?? []);

  const safeEntries = Object.entries(ctx).map(([key, value]) => {
    const transformed = redactor ? redactor(key, value) : value;
    const masked = redactList.has(key) ? REDACTION_MASK : transformed;
    return [key, masked] as const;
  });

  return Object.freeze(Object.fromEntries(safeEntries));
}

/**
 * Cria metadados de observabilidade ricos para instrumentos de logs, métricas e tracing.
 */
function buildObservabilityMetadata<K extends string>(args: {
  readonly bc: string;
  readonly module: string;
  readonly kind: K;
  readonly entry: CatalogEntry;
}): ObservabilityMetadata {
  const severity = args.entry.severity ?? ObservabilitySeverity.Error;

  const tags: Readonly<Record<string, string>> = Object.freeze({
    bc: args.bc,
    module: args.module,
    kind: args.kind,
    code: args.entry.code,
    category: args.entry.category,
    severity,
    ...(args.entry.tags ?? {}),
  });

  const fingerprint: ReadonlyArray<string> = Object.freeze([
    args.bc,
    args.module,
    args.entry.category,
    args.kind,
  ]);

  return Object.freeze({
    category: args.entry.category,
    severity,
    fingerprint,
    tags,
  });
}

/**
 * Resolve metadados de observabilidade válidos mesmo quando o erro não foi criado pelos helpers.
 */
function resolveObservabilityMetadata<K extends string>(params: {
  readonly catalog: Catalog<K>;
  readonly bc: string;
  readonly module: string;
  readonly error: SpecificDomainError<K>;
  readonly fallbackSeverity?: ObservabilitySeverityLevel;
  readonly existing?: ObservabilityMetadata;
}): ObservabilityMetadata {
  if (params.existing) {
    return params.existing;
  }

  const catalogEntry = params.catalog[params.error.kind as K];
  if (catalogEntry) {
    return buildObservabilityMetadata({
      bc: params.bc,
      module: params.module,
      kind: params.error.kind,
      entry: catalogEntry,
    });
  }

  const severity = params.fallbackSeverity ?? ObservabilitySeverity.Error;

  const tags: Readonly<Record<string, string>> = Object.freeze({
    bc: params.bc,
    module: params.module,
    kind: params.error.kind,
    severity,
    category: ErrorTaxonomy.UnexpectedSystemState,
    code: params.error.code,
  });

  const fingerprint: ReadonlyArray<string> = Object.freeze([
    params.bc,
    params.module,
    ErrorTaxonomy.UnexpectedSystemState,
    params.error.kind,
  ]);

  return Object.freeze({
    category: ErrorTaxonomy.UnexpectedSystemState,
    severity,
    fingerprint,
    tags,
  });
}

/**
 * Decora o erro produzido pela fábrica base com metadados adicionais desta composição.
 */
function decorateError<K extends string>(
  error: SpecificDomainError<K>,
  metadata: {
    readonly http?: number;
    readonly safeContext: Readonly<Record<string, unknown>>;
    readonly observability: ObservabilityMetadata;
  },
): ComposedDomainError<K> {
  return Object.assign(error, metadata) as ComposedDomainError<K>;
}

/**
 * Gera a função que cria um erro específico de acordo com o catálogo.
 */
function makeKindHelper<K extends string>(
  kind: K,
  entry: CatalogEntry,
  deps: {
    readonly factory: DomainErrorFactory<K>;
    readonly timestampProvider: TimestampProvider;
    readonly redactor?: ContextRedactor;
    readonly bc: string;
    readonly module: string;
  },
) {
  return (
    ctx: Record<string, unknown> = {},
    extra: { readonly cause?: unknown } = {},
  ): ComposedDomainError<K> => {
    const safeContext = buildSafeContext(ctx, entry, deps.redactor);
    const error = deps.factory.create(kind, {
      ctx,
      cause: extra.cause,
      now: deps.timestampProvider(),
    });

    return decorateError(error, {
      http: entry.http,
      safeContext,
      observability: buildObservabilityMetadata({
        bc: deps.bc,
        module: deps.module,
        kind,
        entry,
      }),
    });
  };
}

/**
 * Formata o erro de domínio em uma representação HTTP genérica incluindo metadados de observabilidade.
 */
function asHttpPayload<K extends string>(
  catalog: Catalog<K>,
  bc: string,
  module: string,
  error: SpecificDomainError<K>,
) {
  const meta = catalog[error.kind as K];
  const status = meta?.http ?? 400;

  const safeContext =
    (error as Partial<ComposedDomainError<K>>).safeContext ?? EMPTY_SAFE_CONTEXT;

  const observability = resolveObservabilityMetadata({
    catalog,
    bc,
    module,
    error,
    existing: (error as Partial<ComposedDomainError<K>>).observability,
  });

  return {
    status,
    body: {
      code: error.code,
      message: error.message,
      category: observability.category,
      severity: observability.severity,
      fingerprint: Array.from(observability.fingerprint),
      tags: { ...observability.tags },
      details: safeContext,
    },
  };
}

/**
 * Gera uma visão pronta para ser enviada a plataformas de observabilidade (logs, métricas, tracing).
 */
function asTelemetry<K extends string>(
  catalog: Catalog<K>,
  bc: string,
  module: string,
  error: SpecificDomainError<K>,
): TelemetrySnapshot<K> {
  const safeContext =
    (error as Partial<ComposedDomainError<K>>).safeContext ?? EMPTY_SAFE_CONTEXT;

  const observability = resolveObservabilityMetadata({
    catalog,
    bc,
    module,
    error,
    existing: (error as Partial<ComposedDomainError<K>>).observability,
  });

  return {
    bc,
    module,
    kind: error.kind,
    id: error.id,
    code: error.code,
    message: error.message,
    category: observability.category,
    severity: observability.severity,
    fingerprint: observability.fingerprint,
    tags: observability.tags,
    safeContext,
    context: error.context,
    cause: error.cause,
  };
}

/**
 * Cria uma fábrica de erros de domínio de alto nível a partir de um catálogo declarativo.
 *
 * @template K Identificadores literais das categorias de erro.
 * @returns Um objeto composto pelos metadados fornecidos e helpers para cada entrada do catálogo.
 */
export function makeDomainErrorFactory<K extends string>(opts: MakeFactoryOptions<K>) {
  const { bc, module, catalog, redactor, codePrefix } = opts;
  const timestampProvider = opts.now ?? (() => new Date());

  const normalized = normalizeCatalog(catalog, codePrefix);

  const factory = new DomainErrorFactory<K>({
    bc,
    module,
    codePrefix: normalized.codePrefix,
    specs: normalized.specs,
  });

  const helpersEntries = (Object.entries(catalog) as [K, CatalogEntry][]).map(
    ([kind, entry]) => [
      kind,
      makeKindHelper(kind, entry, {
        factory,
        timestampProvider,
        redactor,
        bc,
        module,
      }),
    ] as const,
  );

  const helpers = Object.fromEntries(helpersEntries) as Record<
    K,
    (ctx?: Record<string, unknown>, extra?: { readonly cause?: unknown }) => ComposedDomainError<K>
  >;

  const toHttp = (error: SpecificDomainError<K>) =>
    asHttpPayload(catalog, bc, module, error);
  const toTelemetry = (error: SpecificDomainError<K>) =>
    asTelemetry(catalog, bc, module, error);

  return {
    bc,
    module,
    catalog,
    codePrefix: normalized.codePrefix,
    ...helpers,
    toHttp,
    toTelemetry,
  };
}
