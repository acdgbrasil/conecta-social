/**
 * Variante Option mínima apenas para tipagem e exemplos.
 * Substitua por sua implementação real se já existir.
 */
export type Option<T> =
  | Readonly<{ _tag: 'Some'; value: T }>
  | Readonly<{ _tag: 'None' }>;

export const Some = <T>(value: T): Option<T> => ({ _tag: 'Some', value } as const);
export const None = <T = never>(): Option<T> => ({ _tag: 'None' } as const);

/**
 * Representa o resultado de uma operação que pode retornar um valor (`Ok`)
 * ou um erro (`Err`). Ideal para modelar regras de domínio **sem** exceções.
 *
 * Use {@link Ok} para sucesso, {@link Err} para falha e os combinadores
 * para encadear operações de forma funcional (ex.: {@link map}, {@link flatMap}).
 *
 * @typeParam T - Tipo do valor de sucesso.
 * @typeParam E - Tipo do erro em caso de falha.
 *
 * @example
 * ```ts
 * const r1: Result<number, string> = Ok(10);
 * const r2 = Result.map(r1, x => x * 2); // Ok(20)
 *
 * const r3 = Result.flatMap(r2, x =>
 *   x > 10 ? Ok(x.toString()) : Err('baixo')
 * ); // Ok("20")
 * ```
 */
export abstract class Result<T, E> {
  protected constructor() {}

  /**
   * Pattern matching baseado em funções.
   *
   * @param onOk Função chamada quando o resultado é `Ok`.
   * @param onErr Função chamada quando o resultado é `Err`.
   * @returns Retorno da função correspondente ao caso.
   *
   * @example
   * ```ts
   * const msg = r.fold(
   *   v => `OK: ${v}`,
   *   e => `ERR: ${e}`
  * );
  * ```
  */
  fold<R>(onOk: (value: T) => R, onErr: (error: E) => R): R {
    if (this instanceof Ok) return onOk(this.value);
    if (this instanceof Err) return onErr(this.error);
    throw new Error('Result.fold chamado em subtipo desconhecido.');
  }

  /**
   * Transforma o valor de sucesso, preservando o erro.
   *
   * @typeParam U - Novo tipo de sucesso.
   * @param f Função de mapeamento aplicada ao valor de `Ok`.
   * @returns `Ok(f(valor))` se `Ok`; caso contrário, `Err` preservado.
  */
  map<U>(f: (value: T) => U): Result<U, E> {
    if (this instanceof Ok) return new Ok<U, E>(f(this.value));
    if (this instanceof Err) return new Err<U, E>(this.error);
    throw new Error('Result.map chamado em subtipo desconhecido.');
  }

  /**
   * Encadeia outra operação que também pode falhar (a.k.a. `andThen`).
   *
   * @typeParam U - Tipo de sucesso do próximo passo.
   * @param f Função que recebe o sucesso atual e retorna um novo `Result`.
   * @returns Resultado de `f` se `Ok`; caso contrário, `Err` preservado.
  */
  flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    if (this instanceof Ok) return f(this.value);
    if (this instanceof Err) return new Err<U, E>(this.error);
    throw new Error('Result.flatMap chamado em subtipo desconhecido.');
  }

  /**
   * Transforma o erro, preservando o sucesso.
   *
   * @typeParam F - Novo tipo de erro.
   * @param f Função aplicada ao erro de `Err`.
   * @returns `Err(f(erro))` se `Err`; caso contrário, `Ok` preservado.
  */
  mapError<F>(f: (error: E) => F): Result<T, F> {
    if (this instanceof Ok) return new Ok<T, F>(this.value);
    if (this instanceof Err) return new Err<T, F>(f(this.error));
    throw new Error('Result.mapError chamado em subtipo desconhecido.');
  }

  /**
   * Obtém o valor de sucesso ou calcula um valor de fallback a partir do erro.
   *
   * @param onErr Função para produzir um valor a partir do erro.
   * @returns Valor de `Ok` ou o fallback calculado.
   *
   * @example
   * ```ts
   * const n = r.unwrapOrElse(e => defaultFrom(e));
   * ```
   */
  unwrapOrElse(onErr: (error: E) => T): T {
    return this.fold((v) => v, onErr);
  }

  /**
   * `true` se este resultado é um {@link Ok}.
   */
  get isOk(): boolean {
    return this instanceof Ok;
  }

  /**
   * `true` se este resultado é um {@link Err}.
   */
  get isErr(): boolean {
    return this instanceof Err;
  }

  /**
   * Converte para {@link Option}: `Ok(v)` -> `Some(v)`, `Err(_)` -> `None`.
   *
   * @returns `Some(valor)` se `Ok`; `None` se `Err`.
   */
  get valueOrNull(): Option<T> {
    return this.fold<Option<T>>((v) => Some(v), () => None());
  }

  /**
   * Obtém o valor de sucesso ou lança se for `Err`.
   * Use **apenas** quando uma falha indicar erro de programação.
   *
   * @throws {Error} Quando o resultado for `Err`.
   * @returns O valor de sucesso.
   */
  unwrap(): T {
    return this.fold(
      (v) => v,
      (e) => {
        throw new Error(`Tentativa de "unwrap" em um Result.Err: ${String(e)}`);
      },
    );
  }

  /**
   * Obtém o valor de sucesso ou lança com mensagem customizada se for `Err`.
   * Use **apenas** quando uma falha indicar erro de programação.
   *
   * @param message Mensagem que antecede o erro original.
   * @throws {Error} Quando o resultado for `Err`.
   * @returns O valor de sucesso.
   */
  expect(message: string): T {
    return this.fold(
      (v) => v,
      (e) => {
        throw new Error(`${message}. Erro original: ${String(e)}`);
      },
    );
  }

  /**
   * Desestrutura o `Result` em um par de {@link Option}s para facilitar
   * padrões de matching em chamadas pontuais.
   *
   * - `Ok(v)`  → `[Some(v), None()]`
   * - `Err(e)` → `[None(), Some(e)]`
   *
   * @returns Uma tupla imutável `[Option<T>, Option<E>]`.
   *
   * @example
   * ```ts
   * const [success, failure] = r.destruct;
   *
   * if (success._tag === 'Some') {
   *   console.log('OK:', success.value);
   * }
   * if (failure._tag === 'Some') {
   *   console.log('ERR:', failure.value);
   * }
   * ```
  */
  get destruct(): readonly [Option<T>, Option<E>] {
    if (this instanceof Ok) return [Some(this.value), None<E>()] as const;
    if (this instanceof Err) return [None<T>(), Some(this.error)] as const;
    throw new Error('Result.destruct chamado em subtipo desconhecido.');
  }
}

/**
 * Variante de sucesso contendo o valor calculado.
 *
 * @typeParam T - Tipo do valor de sucesso.
 * @typeParam E - Tipo do erro (carregado apenas no tipo; não é usado aqui).
 */
export class Ok<T, E> extends Result<T, E> {
  /**
   * @param value Valor de sucesso (imutável).
   */
  constructor(public readonly value: T) {
    super();
  }
}

/**
 * Variante de falha contendo a informação de erro.
 *
 * @typeParam T - Tipo do valor de sucesso (carregado apenas no tipo).
 * @typeParam E - Tipo do erro.
 */
export class Err<T, E> extends Result<T, E> {
  /**
   * @param error Erro associado ao resultado (imutável).
   */
  constructor(public readonly error: E) {
    super();
  }
}

/**
 * Construtor conveniente para `Ok`.
 *
 * @typeParam T - Tipo do valor de sucesso.
 * @typeParam E - Tipo do erro.
 */
export const ok = <T, E = never>(value: T): Result<T, E> => new Ok<T, E>(value);

/**
 * Construtor conveniente para `Err`.
 *
 * @typeParam T - Tipo do valor de sucesso.
 * @typeParam E - Tipo do erro.
 */
// Guarda de tipo que rejeita erros tipados como `any`/`unknown`.
type ForbidAnyOrUnknown<E> = 0 extends (1 & E)
  ? ['`Result.err` requer um tipo de erro explícito; `any`/`unknown` não são permitidos.']
  : [];

export const err = <T = never, E>(
  error: E,
  ..._constraints: ForbidAnyOrUnknown<E>
): Result<T, E> => new Err<T, E>(error);
