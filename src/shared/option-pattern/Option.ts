// --- Tipos Base Imutáveis ---
export type Some<T> = { readonly kind: "some"; readonly value: T };
export type None = { readonly kind: "none" };
export type Option<T> = Some<T> | None;

// --- Construtores ---

/**
 * Cria um Option contendo um valor.
 */
const some = <T>(value: T): Option<T> => ({ kind: "some", value });

/**
 * Cria um Option vazio (None).
 */
const none = (): Option<never> => ({ kind: "none" });

/**
 * Cria um Option a partir de um valor que pode ser null ou undefined.
 * Se for null/undefined, retorna None. Caso contrário, retorna Some(valor).
 */
const fromNullable = <T>(value: T | null | undefined): Option<NonNullable<T>> =>
  value === null || value === undefined ? none() : some(value as NonNullable<T>);

/**
 * Executa uma função que pode lançar exceção de forma segura.
 * Retorna Some(resultado) se der certo, ou None se houver erro.
 * Útil para interagir com APIs legadas ou bibliotecas de terceiros instáveis.
 *
 * @example
 * ```ts
 * const opt = Option.safe(() => JSON.parse("invalid")); // None
 * ```
 */
const safe = <T>(fn: () => T): Option<T> => {
  try {
    return some(fn());
  } catch {
    return none();
  }
};

/**
 * Cria um Option condicionalmente.
 * Retorna Some(valor) se o predicado for verdadeiro, caso contrário None.
 *
 * @example
 * ```ts
 * const valid = Option.fromPredicate(age, a => a >= 18);
 * ```
 */
const fromPredicate = <T>(value: T, predicate: (v: T) => boolean): Option<T> =>
  predicate(value) ? some(value) : none();

// --- Type Guards ---

const isSome = <T>(opt: Option<T>): opt is Some<T> => opt.kind === "some";
const isNone = <T>(opt: Option<T>): opt is None => opt.kind === "none";

// --- Transformações (Puras) ---

/**
 * Transforma o valor dentro do Option se ele existir.
 * Se for None, retorna None.
 */
const map = <T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> =>
  isSome(opt) ? some(fn(opt.value)) : none();

/**
 * Encadeia operações que retornam Option.
 * Útil para evitar Option<Option<T>>.
 */
const flatMap = <T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
  isSome(opt) ? fn(opt.value) : none();

/**
 * Filtra o valor dentro do Option.
 * Se o predicado retornar false, o resultado vira None.
 */
const filter = <T>(opt: Option<T>, predicate: (value: T) => boolean): Option<T> =>
  isSome(opt) && predicate(opt.value) ? opt : none();

// --- Recuperação de Valor ---

/**
 * Retorna o valor ou lança um erro se for None.
 * ⚠️ Use com cuidado! Prefira `unwrapOr` ou `match`.
 */
const unwrap = <T>(opt: Option<T>): T => {
  if (isSome(opt)) return opt.value;
  throw new Error("Called unwrap on None");
};

/**
 * Retorna o valor contido ou um valor padrão (fallback) caso seja None.
 */
const unwrapOr = <T>(opt: Option<T>, fallback: T): T => (isSome(opt) ? opt.value : fallback);

/**
 * Retorna o valor contido ou executa uma função para obter o valor padrão (lazy fallback).
 * Útil quando o fallback é custoso de computar.
 */
const unwrapOrElse = <T>(opt: Option<T>, fallback: () => T): T => (isSome(opt) ? opt.value : fallback());

/**
 * Pattern matching para Option.
 * Força o tratamento de ambos os casos: Some e None.
 */
const match = <T, U>(opt: Option<T>, handlers: { some: (val: T) => U; none: () => U }): U =>
  isSome(opt) ? handlers.some(opt.value) : handlers.none();

// --- Utilitários Avançados ---

/**
 * Combina dois Options em um par.
 * Só retorna Some se AMBOS forem Some.
 */
const zip = <T, U>(optA: Option<T>, optB: Option<U>): Option<[T, U]> =>
  isSome(optA) && isSome(optB) ? some([optA.value, optB.value]) : none();

/**
 * Converte uma lista de Options em um Option de lista.
 * Se algum elemento for None, retorna None.
 * Similar ao Promise.all, mas síncrono.
 */
const all = <T>(options: readonly Option<T>[]): Option<T[]> => {
  const values: T[] = [];
  for (const opt of options) {
    if (isNone(opt)) return none();
    values.push(opt.value);
  }
  return some(values);
};

// --- Namespace Unificado ---

export const Option = {
  some,
  none,
  fromNullable,
  safe,
  fromPredicate,
  isSome,
  isNone,
  map,
  flatMap,
  filter,
  match,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  zip,
  all,
};