import type { DeepReadonly } from "@conecta/fn";

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

export type ObservabilitySeverityLevel = (typeof ObservabilitySeverity)[keyof typeof ObservabilitySeverity];

/**
 * Taxonomia de categorias observáveis para classificar incidentes.
 */
export const ErrorTaxonomy = {
  DomainRuleViolation: "DOMAIN_RULE_VIOLATION",
  ExternalApiFailure: "EXTERNAL_API_FAILURE",
  ExternalContractMismatch: "EXTERNAL_CONTRACT_MISMATCH",
  CrossLayerCommunication: "CROSS_LAYER_COMMUNICATION_FAILURE",
  DataConsistencyIncident: "DATA_CONSISTENCY_INCIDENT",
  SecurityBoundaryViolation: "SECURITY_BOUNDARY_VIOLATION",
  InfrastructureDependencyFailure: "INFRASTRUCTURE_DEPENDENCY_FAILURE",
  ObservabilityPipelineFailure: "OBSERVABILITY_PIPELINE_FAILURE",
  UnexpectedSystemState: "UNEXPECTED_SYSTEM_STATE",
  Conflict: "CONFLICT",
} as const;

export type ErrorCategory = (typeof ErrorTaxonomy)[keyof typeof ErrorTaxonomy];

/**
 * Metadados de observabilidade para logs, métricas e tracing.
 * Utilizado para agrupar e filtrar incidentes em dashboards operacionais.
 */
export interface ObservabilityMetadata {
  /** Categoria analítica (ex: Erro de Regra de Negócio, Falha de Infra). */
  readonly category: ErrorCategory;
  /** Nível de severidade (Error, Critical, etc). */
  readonly severity: ObservabilitySeverityLevel;
  /** Lista de strings estáveis que formam um 'fingerprint' para agrupamento de erros idênticos. */
  readonly fingerprint: readonly string[];
  /** Tags chave-valor para busca e segmentação. */
  readonly tags: Record<string, string>;
}

/**
 * Contrato base para erros de domínio imutáveis e ricos em contexto.
 * Representa um incidente ocorrido dentro do domínio da aplicação.
 * 
 * @example
 * ```ts
 * if (Result.isErr(result)) {
 *   console.log(result.error.message);
 *   logger.error(DomainError.toTelemetry(result.error));
 * }
 * ```
 */
export type DomainError = DeepReadonly<{
  /** ID único e descritivo gerado no momento do erro. */
  readonly id: string;
  /** Código estável do erro para referência em manuais ou suporte (ex: PAT-001). */
  readonly code: string;
  /** Mensagem final amigável e interpolada. */
  readonly message: string;
  /** Bounded context de origem. */
  readonly bc: string;
  /** Módulo ou subdomínio de origem. */
  readonly module: string;
  /** Tipo específico do erro dentro do catálogo. */
  readonly kind: string;
  /** Contexto original com dados brutos. */
  readonly context: Record<string, unknown>;
  /** Contexto sanitizado (redacted) seguro para logs externos ou front-end. */
  readonly safeContext: Record<string, unknown>;
  /** Metadados estruturados para ferramentas de observabilidade (Sentry, NewRelic, etc). */
  readonly observability: ObservabilityMetadata;
  /** Sugestão de status HTTP para camadas de delivery. */
  readonly http?: number;
  /** Pilha de execução original se capturada. */
  readonly stackTrace?: string;
  /** Causa raiz (erro original) que disparou este incidente. */
  readonly cause?: unknown;
}>;

/**
 * Erro de domínio especializado com tipagem nominal para o 'kind'.
 */
export type SpecificDomainError<K extends string> = DomainError & {
  readonly kind: K;
};