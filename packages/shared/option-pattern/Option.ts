type SomeOption<T> = {
  readonly kind: "some";
  readonly isSome: true;
  readonly isNone: false;
  readonly value: T;
  unwrap(): T;
  unwrapOr<V>(fallback: V): T | V;
  map<U>(fn: (value: T) => U): Option<U>;
};

type NoneOption<T> = {
  readonly kind: "none";
  readonly isSome: false;
  readonly isNone: true;
  unwrap(): never;
  unwrapOr<V>(fallback: V): V;
  map<U>(fn: (value: T) => U): Option<U>;
};

export const unSafe = <T>(value: T | undefined | null): Option<T> =>
  value === null || value === undefined ? None<T>() : Some(value);

export type Option<T> = SomeOption<T> | NoneOption<T>;

const freeze = <T extends object>(value: T): T => Object.freeze(value);

export const Some = <T>(value: T): Option<T> =>
  freeze<SomeOption<T>>({
    kind: "some",
    isSome: true,
    isNone: false,
    value,
    unwrap: () => value,
    unwrapOr: () => value,
    map: (fn) => Some(fn(value)),
  });

export const None = <T = unknown>(): Option<T> =>
  freeze<NoneOption<T>>({
    kind: "none",
    isSome: false,
    isNone: true,
    unwrap: () => {
      throw new Error("Cannot unwrap value from None");
    },
    unwrapOr: (fallback) => fallback,
    map: () => None(),
  });
