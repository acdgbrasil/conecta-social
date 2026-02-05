import type { DomainError } from "@conecta/domain-error";
import { DomainErrorFactory } from "@conecta/domain-error";

type Ok<T> = {
  readonly kind: "ok";
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};

type Err<E, T = never> = {
  readonly kind: "err";
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
};

type ResultCore<T, E> = Ok<T> | Err<E, T>;

type ResultHandlers<T, E, U> = {
  ok: (value: T) => U;
  err: (error: E) => U;
};

type ResultMethods<T, E> = {
  readonly unwrap: () => T;
  readonly unwrapErr: () => E;
  readonly map: <U>(fn: (value: T) => U) => Result<U, E>;
  readonly mapErr: <E2>(fn: (error: E) => E2) => Result<T, E2>;
  readonly flatMap: <U, E2>(
    fn: (value: T) => Result<U, E2>,
  ) => Result<U, E | E2>;
  readonly unwrapOrElse: (fn: (error: E) => T) => T;
  readonly unwrapOr: (fallback: T) => T;
  readonly orElse: <E2>(fn: (error: E) => Result<T, E2>) => Result<T, E2>;
  readonly match: <U>(handlers: ResultHandlers<T, E, U>) => U;
};

export type Result<T, E> = ResultCore<T, E> & ResultMethods<T, E>;

const buildResultError = (
  name: "CalledUnwrapErrOnOk" | "CalledUnwrapOnErr",
  message: string,
) =>
  new DomainErrorFactory({
    bc: "SHARED",
    module: "Result",
    codePrefix: "RES",
    specs: {
      CalledUnwrapErrOnOk: ["001", () => "Called unwrapErr on an Ok result."],
      CalledUnwrapOnErr: ["002", () => "Called unwrap on an Err result."],
    },
  }).create(name, {
    cause: message,
    now: new Date(),
    st: new Error().stack,
  });

export const isOk = <T, E>(result: ResultCore<T, E>): result is Ok<T> =>
  result.kind === "ok";

export const isErr = <T, E>(result: ResultCore<T, E>): result is Err<E, T> =>
  result.kind === "err";

export const unwrap = <T, E>(result: ResultCore<T, E>): T => {
  if (result.kind === "ok") return result.value;
  throw buildResultError("CalledUnwrapOnErr", "Called unwrap on an Err result");
};

export const unwrapErr = <T, E>(result: ResultCore<T, E>): E => {
  if (result.kind === "err") return result.error;
  throw buildResultError(
    "CalledUnwrapErrOnOk",
    "Called unwrapErr on an Ok result",
  );
};

export const map = <T, E, U>(
  result: ResultCore<T, E>,
  fn: (value: T) => U,
): Result<U, E> =>
  result.kind === "ok" ? ok(fn(result.value)) : err<U, E>(result.error);

export const mapErr = <T, E, E2>(
  result: ResultCore<T, E>,
  fn: (error: E) => E2,
): Result<T, E2> =>
  result.kind === "err" ? err<T, E2>(fn(result.error)) : ok(result.value);

export const flatMap = <T, E, U, E2>(
  result: ResultCore<T, E>,
  fn: (value: T) => Result<U, E2>,
): Result<U, E | E2> =>
  result.kind === "ok" ? fn(result.value) : err<U, E | E2>(result.error);

export const unwrapOrElse = <T, E>(
  result: ResultCore<T, E>,
  fn: (error: E) => T,
): T => (result.kind === "ok" ? result.value : fn(result.error));

export const unwrapOr = <T, E>(result: ResultCore<T, E>, fallback: T): T =>
  result.kind === "ok" ? result.value : fallback;

export const orElse = <T, E, E2>(
  result: ResultCore<T, E>,
  fn: (error: E) => Result<T, E2>,
): Result<T, E2> =>
  result.kind === "ok" ? ok(result.value) : fn(result.error);

export const match = <T, E, U>(
  result: ResultCore<T, E>,
  handlers: ResultHandlers<T, E, U>,
): U => (result.kind === "ok" ? handlers.ok(result.value) : handlers.err(result.error));

const withMethods = <T, E>(result: ResultCore<T, E>): Result<T, E> => ({
  ...result,
  unwrap: () => unwrap(result),
  unwrapErr: () => unwrapErr(result),
  map: <U>(fn: (value: T) => U) => map(result, fn),
  mapErr: <E2>(fn: (error: E) => E2) => mapErr(result, fn),
  flatMap: <U, E2>(fn: (value: T) => Result<U, E2>) => flatMap(result, fn),
  unwrapOrElse: (fn: (error: E) => T) => unwrapOrElse(result, fn),
  unwrapOr: (fallback: T) => unwrapOr(result, fallback),
  orElse: <E2>(fn: (error: E) => Result<T, E2>) => orElse(result, fn),
  match: <U>(handlers: ResultHandlers<T, E, U>) => match(result, handlers),
});

export const ok = <T, E = never>(value: T): Result<T, E> =>
  withMethods({
    kind: "ok",
    isOk: true,
    isErr: false,
    value,
  });

export const err = <T = never, E = DomainError>(error: E): Result<T, E> =>
  withMethods({
    kind: "err",
    isOk: false,
    isErr: true,
    error,
  });
