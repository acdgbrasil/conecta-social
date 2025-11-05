// shared/erros-pattern/shortcuts.ts

type ArgsFor<S extends readonly unknown[]> = { [I in keyof S]: unknown };

export function shortcuts<
  Spec extends Record<string, readonly string[]>,
  H extends { [K in keyof Spec]: (ctx?: Record<string, unknown>, extra?: { cause?: unknown }) => any }
>(
  helpers: H,         // precisa ter, no mínimo, as chaves do spec
  spec: Spec
) {
  const out: Partial<Record<keyof Spec, (...args: unknown[]) => any>> = {};

  (Object.keys(spec) as (keyof Spec)[]).forEach((kind) => {
    const keys = spec[kind];
    out[kind] = (...args: unknown[]) => {
      const cause = args.length > keys.length ? args[keys.length] : undefined;
      const ctx: Record<string, unknown> = {};
      for (let i = 0; i < keys.length; i++) {
        const v = args[i];
        if (v !== undefined) ctx[keys[i] as string] = v;
      }
      return helpers[kind]!(ctx, { cause });
    };
  });

  type Ret = {
    [K in keyof Spec]:
      ((...args: ArgsFor<Spec[K]>) => ReturnType<H[K]>) &
      ((...args: [...ArgsFor<Spec[K]>, unknown]) => ReturnType<H[K]>) // com cause
  };

  return out as Ret;
}
