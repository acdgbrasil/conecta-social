/**
 * Contrato base para erros de domínio ricos em contexto.
 * Mantém identificação, código, mensagem amigável e dados de depuração.
 */
export interface DomainError {
  /** ex: CORE@queue_management/daily_visit#invalidStatusTransition-time:23/09/2025:16:10:05-tz:America/Fortaleza(-03:00) */
  readonly id: string;
  /** ex: DVIS-001 */
  readonly code: string;
  /** Mensagem final interpolada e amigável para o usuário. */
  readonly message: string;
  /** Bounded context (ex: CORE) */
  readonly bc: string;
  /** Módulo/subdomínio (ex: queue_management/daily_visit) */
  readonly module: string;
  /** Dados extras para depuração e logs. Use `unknown` para segurança de tipo. */
  readonly context: Readonly<Record<string, unknown>>;
  /** A pilha de chamadas, se disponível. */
  readonly stackTrace?: string;
  /** O erro original que causou este erro de domínio. */
  readonly cause?: unknown;
}

/**
 * Implementação padrão de erro parametrizada por um tipo de string literal ou enum.
 * Ideal para padronizar mensagens e códigos dentro de um bounded context.
 *
 * @template K - Um conjunto de strings literais que representa os tipos de erro (ex: 'USER_NOT_FOUND' | 'INVALID_EMAIL').
 */
export class SpecificDomainError<K extends string> implements DomainError {
  public readonly id: string;
  public readonly code: string;
  public readonly message: string;
  public readonly bc: string;
  public readonly module: string;
  public readonly context: Readonly<Record<string, unknown>>;
  public readonly stackTrace?: string;
  public readonly cause?: unknown;

  /** O tipo específico do erro, vindo do enum/tipo genérico K. */
  public readonly kind: K;

  constructor(args: {
    id: string;
    code: string;
    message: string;
    bc: string;
    module: string;
    kind: K;
    context?: Record<string, unknown>;
    stackTrace?: string;
    cause?: unknown;
  }) {
    this.id = args.id;
    this.code = args.code;
    this.message = args.message;
    this.bc = args.bc;
    this.module = args.module;
    this.kind = args.kind;
    // Garante imutabilidade superficial para o objeto de contexto.
    this.context = Object.freeze(args.context ?? {});
    this.stackTrace = args.stackTrace;
    this.cause = args.cause;
  }
}
