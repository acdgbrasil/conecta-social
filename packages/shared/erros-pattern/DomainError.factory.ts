import { SpecificDomainError } from './DomainError';

/**
 * Define a assinatura para uma função que gera uma string de template.
 * @param ctx - Um objeto de contexto com valores para interpolar.
 * @returns A string de template.
 */
export type Template = (ctx: Record<string, unknown>) => string;

// Helper para formatar datas no padrão brasileiro para o timezone de Fortaleza (UTC-3).
// Usar a API Intl é uma boa prática para evitar erros de fuso horário e formatação.
const formatadorDataBr = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'America/Fortaleza',
});

function formatarDataParaId(date: Date): string {
  const parts = formatadorDataBr.formatToParts(date);
  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const day = find('day');
  const month = find('month');
  const year = find('year');
  const hour = find('hour');
  const minute = find('minute');
  const second = find('second');

  return `${day}/${month}/${year}:${hour}:${minute}:${second}`;
}

/**
 * Gera um ID descritivo para o erro.
 * Formato: [CAMADA]@[MODULO]#[TIPO]-time:DD/MM/YYYY:HH:MM:SS-tz:America/Fortaleza(-03:00)
 */
function generateDescriptiveId(args: {
  layer: string;
  module: string;
  type: string;
  now?: Date; // para testes
}): string {
  const now = args.now ?? new Date();
  const timeStr = formatarDataParaId(now);
  return `${args.layer}@${args.module}#${args.type}-time:${timeStr}-tz:America/Fortaleza(-03:00)`;
}

/**
 * Fabrica instâncias de `SpecificDomainError` a partir de um tipo literal de categorias.
 * Facilita a padronização de códigos, mensagens e metadados para cada módulo.
 *
 * @template K - Um conjunto de strings literais que representa os tipos de erro.
 */
export class DomainErrorFactory<K extends string> {
  private readonly bc: string;
  private readonly module: string;
  private readonly codePrefix: string;
  // Mapeia um tipo de erro (K) para um tupla contendo [shortCode, templateFunction]
  private readonly specs: Readonly<Record<K, readonly [string, Template]>>;

  constructor(args: {
    bc: string;
    module: string;
    codePrefix: string;
    specs: Record<K, readonly [string, Template]>;
  }) {
    this.bc = args.bc;
    this.module = args.module;
    this.codePrefix = args.codePrefix;
    this.specs = args.specs;
  }

  /**
   * Cria uma nova instância de SpecificDomainError.
   * Substitui o método `call` do Dart.
   */
  public create(
    kind: K,
    options: {
      ctx?: Record<string, unknown>;
      cause?: unknown;
      st?: string; // Em JS/TS, stack trace é geralmente uma string
      now?: Date; // Para testes
    } = {},
  ): SpecificDomainError<K> {
    const { ctx = {}, cause, st, now = new Date() } = options;

    const spec = this.specs[kind];
    if (!spec) {
        throw new Error(`Especificação de erro não encontrada para o tipo: ${kind}`);
    }
    const [shortCode, templateFn] = spec;

    const code = `${this.codePrefix}-${shortCode}`;

    const safe = (v: unknown): string => (v === null || v === undefined ? '∅' : String(v));
    const render = (template: string, context: Record<string, unknown>): string =>
      template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => safe(context[key]));

    const message = render(templateFn(ctx), ctx);
    const id = generateDescriptiveId({
      layer: this.bc,
      module: this.module,
      type: kind,
      now,
    });

    const enrichedCtx = {
      ...ctx,
      tz: 'America/Fortaleza',
      tz_offset: '-03:00',
      generated_at_br: formatarDataParaId(now),
    };

    return new SpecificDomainError<K>({
      id,
      code,
      message,
      bc: this.bc,
      module: this.module,
      kind,
      context: enrichedCtx,
      stackTrace: st,
      cause,
    });
  }
}