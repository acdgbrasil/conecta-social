export type Some<T> = { readonly kind: "some"; readonly isSome: true; readonly isNone: false; readonly value: T };
export type None = { readonly kind: "none"; readonly isSome: false; readonly isNone: true };
export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Option<T> => ({ kind: "some", isSome: true, isNone: false, value });
export const none = (): None => ({ kind: "none", isSome: false, isNone: true });
export const fromNullable = <T>(value: T | null | undefined): Option<NonNullable<T>> =>
  value === null || value === undefined ? none() : some(value as NonNullable<T>);

export const isSome = <T>(opt: Option<T>): opt is Some<T> => opt.isSome;
export const isNone = <T>(opt: Option<T>): opt is None => opt.isNone;
export const contains = <T>(opt: Option<T>, value: T): boolean => isSome(opt) && opt.value === value;
export const exists = <T>(opt: Option<T>, predicate: (value: T) => boolean): boolean =>
  isSome(opt) && predicate(opt.value);

export const map = <T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> =>
  isSome(opt) ? some(fn(opt.value)) : none();

export const flatMap = <T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
  isSome(opt) ? fn(opt.value) : none();

export const filter = <T>(opt: Option<T>, predicate: (value: T) => boolean): Option<T> =>
  isSome(opt) && predicate(opt.value) ? opt : none();

export const orElse = <T>(opt: Option<T>, fallback: () => Option<T>): Option<T> =>
  isSome(opt) ? opt : fallback();

export const match = <T, U>(opt: Option<T>, handlers: { some: (value: T) => U; none: () => U }): U =>
  isSome(opt) ? handlers.some(opt.value) : handlers.none();

export const unwrap = <T>(opt: Option<T>): T => {
  if (isSome(opt)) return opt.value;
  throw new Error("Cannot unwrap value from None");
};

export const unwrapOr = <T, F>(opt: Option<T>, fallback: F): T | F => (isSome(opt) ? opt.value : fallback);

export const unwrapOrElse = <T, F>(opt: Option<T>, fallback: () => F): T | F =>
  (isSome(opt) ? opt.value : fallback());

export const all = <T>(options: ReadonlyArray<Option<T>>): Option<T[]> => {
  const acc: T[] = [];
  for (const opt of options) {
    if (isNone(opt)) return none();
    acc.push(opt.value);
  }
  return some(acc);
};

export const Option = {
  some,
  none,
  fromNullable,
  isSome,
  isNone,
  contains,
  exists,
  map,
  flatMap,
  filter,
  orElse,
  match,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  all,
};

// Backwards-compatible aliases
export const Some = some;
export const None = none;
export const unSafe = fromNullable;
