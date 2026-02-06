import type { DomainError } from "@conecta/domain-error";

// --- Tipos Base Imutáveis ---
export type Ok<T> = {
  readonly kind: "ok";
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};

export type Err<E> = {
  readonly kind: "err";
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
};

export type Result<T, E = DomainError> = Ok<T> | Err<E>;

// Métodos compartilhados (sem closures por instância)
const resultProto = {
  map<T, E, U>(this: Result<T, E>, fn: (v: T) => U): Result<U, E> {
    return map(this, fn);
  },
  mapErr<T, E, F>(this: Result<T, E>, fn: (e: E) => F): Result<T, F> {
    return mapErr(this, fn);
  },
  flatMap<T, E, U, F>(this: Result<T, E>, fn: (v: T) => Result<U, F>): Result<U, E | F> {
    return flatMap(this, fn);
  },
  match<T, E, U>(this: Result<T, E>, handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return match(this, handlers);
  },
  unwrap<T, E>(this: Result<T, E>): T {
    return unwrap(this);
  },
  unwrapErr<T, E>(this: Result<T, E>): E {
    return unwrapErr(this);
  },
  unwrapOr<T, E>(this: Result<T, E>, fallback: T): T {
    return unwrapOr(this, fallback);
  },
  unwrapOrElse<T, E>(this: Result<T, E>, fn: (error: E) => T): T {
    return unwrapOrElse(this, fn);
  },
  orElse<T, E, F>(this: Result<T, E>, fn: (error: E) => Result<T, F>): Result<T, F> {
    return orElse(this, fn);
  },
};

// --- Factories Simples ---
export const ok = <T, E = never>(value: T): Result<T, E> => {
  const r = {
    kind: "ok" as const,
    isOk: true as const,
    isErr: false as const,
    value,
  } satisfies Ok<T>;
  return Object.setPrototypeOf(r, resultProto);
};

export const err = <T = never, E = DomainError>(error: E): Result<T, E> => {
  const r = {
    kind: "err" as const,
    isOk: false as const,
    isErr: true as const,
    error,
  } satisfies Err<E>;
  return Object.setPrototypeOf(r, resultProto);
};

// --- Operadores Funcionais (Puros) ---
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.isOk;
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.isErr;

/**
 * Retorna o valor de sucesso ou lança uma exceção se for erro.
 * Use com cuidado! Preferencialmente apenas em testes.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.isOk) return result.value;
  throw new Error(`Called unwrap on an Err result: ${JSON.stringify(result.error)}`);
};

export const unwrapErr = <T, E>(result: Result<T, E>): E => {
  if (result.isErr) return result.error;
  throw new Error(`Called unwrapErr on an Ok result: ${JSON.stringify(result.value)}`);
};

export const safe = <T>(fn: () => T): Result<T, unknown> => {
  try {
    return ok(fn());
  } catch (error) {
    return err(error);
  }
};

export const map = <T, E, U>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  r.isOk ? ok(fn(r.value)) : (r as unknown as Result<U, E>);

export const mapErr = <T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> =>
  r.isErr ? err(fn(r.error)) : (r as unknown as Result<T, F>);

export const flatMap = <T, E, U, F>(r: Result<T, E>, fn: (v: T) => Result<U, F>): Result<U, E | F> =>
  r.isOk ? fn(r.value) : (r as unknown as Result<U, E | F>);

export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.isOk ? result.value : fallback;

export const unwrapOrElse = <T, E>(result: Result<T, E>, fn: (error: E) => T): T =>
  (result.isOk ? result.value : fn(result.error));

export const match = <T, E, U>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => U; err: (error: E) => U },
): U => (result.isOk ? handlers.ok(result.value) : handlers.err(result.error));

export const orElse = <T, E, F>(result: Result<T, E>, fn: (error: E) => Result<T, F>): Result<T, F> =>
  result.isOk ? ok(result.value) : fn(result.error);

// --- Namespace Result ---
export const Result = {
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  map,
  mapErr,
  flatMap,
  match,
  unwrapOr,
  unwrapOrElse,
  unwrapErr,
  orElse,
  safe,

  /**
   * Transforma uma lista de Resultados em um Resultado de Lista.
   * Se houver algum erro, retorna o primeiro encontrado.
   * Result<T, E>[] -> Result<T[], E>
   */
  all: <T, E>(results: ReadonlyArray<Result<T, E>>): Result<T[], E> => {
    const values: T[] = [];
    for (const r of results) {
      if (r.isErr) return err(r.error);
      values.push(r.value);
    }
    return ok(values);
  },

  /**
   * Combina resultados, útil para Promises.all().
   */
  promiseAll: async <T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>> => {
    return Result.all(await Promise.all(promises));
  },
};
