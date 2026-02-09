import type { SpecificDomainError } from "./DomainError";

/**
 * Cria atalhos (shortcuts) posicionais para criação de erros.
 * Útil para reduzir o boilerplate de passar objetos de contexto manualmente.
 * 
 * @example
 * ```ts
 * const Errors = makeDomainErrorFactory({ ... });
 * const P = shortcuts(Errors, {
 *   UserNotFound: ["userId"]
 * });
 * 
 * throw P.UserNotFound("123"); // Cria o erro com { userId: "123" }
 * ```
 */
export function shortcuts<
  Spec extends Record<string, readonly string[]>,
  H extends {
    [K in keyof Spec]: (
      ctx?: Record<string, unknown>,
      extra?: { cause?: unknown },
    ) => any;
  },
>(
  helpers: H,
  spec: Spec,
) {
  const out: any = {};

  for (const kind of Object.keys(spec)) {
    const keys = spec[kind];
    out[kind] = (...args: unknown[]) => {
      // O último argumento pode ser a 'cause' se houver mais argumentos que chaves no spec
      const hasCause = args.length > keys.length;
      const cause = hasCause ? args[keys.length] : undefined;
      
      const ctx: Record<string, unknown> = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = args[i];
        if (value !== undefined) {
          ctx[key] = value;
        }
      }
      
      return helpers[kind as keyof H](ctx, { cause });
    };
  }

  type ArgsFor<S extends readonly unknown[]> = { [I in keyof S]: unknown };
  
  type Ret = {
    [K in keyof Spec]: ((...args: [...ArgsFor<Spec[K]>, unknown?]) => ReturnType<H[K]>);
  };

  return out as Ret;
}