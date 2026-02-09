import type { DomainError } from "@conecta/shared/erros-pattern/DomainError";

// --- Tipos Base Imutáveis (Plain Objects) ---
export type Ok<T> = { readonly kind: "ok"; readonly value: T };
export type Err<E> = { readonly kind: "err"; readonly error: E };
export type Result<T, E = DomainError> = Ok<T> | Err<E>;

// --- Construtores (Locais) ---

const ok = <T>(value: T): Ok<T> => ({ kind: "ok", value });

const err = <E>(error: E): Err<E> => ({ kind: "err", error });

const safe = <T>(fn: () => T): Result<T, unknown> => {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
};

const tryAsync = async <T>(promise: Promise<T>): Promise<Result<T, unknown>> => {
  try {
    const value = await promise;
    return ok(value);
  } catch (e) {
    return err(e);
  }
};

const fromCondition = <T, E>(predicate: boolean, value: T, error: E): Result<T, E> =>
  predicate ? ok(value) : err(error);

// --- Type Guards (Locais) ---

const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.kind === "ok";
const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.kind === "err";

// --- Transformações (Locais) ---

const map = <T, E, U>(result: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  isOk(result) ? ok(fn(result.value)) : result;

const mapErr = <T, E, F>(result: Result<T, E>, fn: (e: E) => F): Result<T, F> =>
  isErr(result) ? err(fn(result.error)) : (result as unknown as Result<T, F>);

const flatMap = <T, E, U, F>(result: Result<T, E>, fn: (v: T) => Result<U, F>): Result<U, E | F> =>
  isOk(result) ? fn(result.value) : (result as unknown as Result<U, E | F>);

// --- Recuperação (Locais) ---

const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) return result.value;
  throw new Error(`Called unwrap on Err: ${JSON.stringify(result.error)}`);
};

const unwrapErr = <T, E>(result: Result<T, E>): E => {
  if (isErr(result)) return result.error;
  throw new Error(`Called unwrapErr on Ok: ${JSON.stringify(result.value)}`);
};

const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  isOk(result) ? result.value : fallback;

const unwrapOrElse = <T, E>(result: Result<T, E>, fn: (e: E) => T): T =>
  isOk(result) ? result.value : fn(result.error);

const match = <T, E, U>(
  result: Result<T, E>,
  handlers: { ok: (val: T) => U; err: (err: E) => U },
): U => (isOk(result) ? handlers.ok(result.value) : handlers.err(result.error));

// --- Utilitários Avançados (Locais) ---

const all = <T, E>(results: readonly Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const r of results) {
    if (isErr(r)) return r;
    values.push(r.value);
  }
  return ok(values);
};

const promiseAll = async <T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>> =>
  all(await Promise.all(promises));

/**
 * Combina um objeto de Results em um único Result de um objeto.
 * Útil para validação de múltiplos DTOs/VOs simultaneamente.
 */
const combine = <T extends Record<string, Result<any, any>>>(
  results: T,
): Result<{ [K in keyof T]: T[K] extends Result<infer V, any> ? V : never }, any> => {
  const values = {} as any;
  for (const [key, result] of Object.entries(results)) {
    if (isErr(result)) return result;
    values[key] = result.value;
  }
  return ok(values);
};

// --- Namespace Unificado (Único Export de Valor) ---
export const Result = {
  ok,
  err,
  safe,
  tryAsync,
  fromCondition,
  isOk,
  isErr,
  map,
  mapErr,
  flatMap,
  match,
  unwrap,
  unwrapErr,
  unwrapOr,
  unwrapOrElse,
  all,
  promiseAll,
  combine,
};