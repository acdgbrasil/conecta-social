import type { DomainError } from "@conecta/domain-error";
import { DomainErrorFactory } from "@conecta/domain-error";

type Ok<T> = {
    readonly isOk: true;
    readonly isErr: false;
    readonly value: T;
    readonly unwrap: () => T;
    readonly unwrapErr: () => never;
    readonly map: <U>(fn: (value: T) => U) => Result<U, never>;
    readonly flatMap: <U, E2>(fn: (value: T) => Result<U, E2>) => Result<U, never | E2>;
};

type Err<E> = {
    readonly isOk: false;
    readonly isErr: true;
    readonly error: E;
    readonly unwrap: () => never;
    readonly unwrapErr: () => E;
    readonly map: <U>(fn: (value: U) => U) => Result<U, E>;
    readonly flatMap: <U, E2>(fn: (value: U) => Result<U, E2>) => Result<U, E | E2>;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T, E = never>(value: T): Result<T, E> => ({
    isErr: false,
    isOk: true,
    value,
    unwrap: () => value,
    unwrapErr: () => { throw new DomainErrorFactory({bc:'SHARED',module:'Result',codePrefix:'RES',specs:{CalledUnwrapErrOnOk:['001', () => `Called unwrapErr on an Ok result.`]}}).create("CalledUnwrapErrOnOk",{cause:"Called unwrapErr on an Ok result",now:new Date(),st:(new Error()).stack}); },
    map: <U>(fn: (v: T) => U) => ok(fn(value)),
    flatMap: <U, E2>(fn: (v: T) => Result<U, E2>) => fn(value),
});

export const err = <E= DomainError>(error: E): Result<never,E> => ({
    isErr: true,
    isOk: false,
    error,
    unwrap: () => { throw new DomainErrorFactory({bc:'SHARED',module:'Result',codePrefix:'RES',specs:{CalledUnwrapOnErr:['002', () => `Called unwrap on an Err result.`]}}).create("CalledUnwrapOnErr",{cause:"Called unwrap on an Err result",now:new Date(),st:(new Error()).stack}); },
    unwrapErr: () => error,
    map: () => err(error),
    flatMap: () => err(error),
});

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.isOk;
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.isErr;
