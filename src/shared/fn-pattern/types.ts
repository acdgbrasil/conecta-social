/**
 * Cria um tipo "Branded" (marcado) para garantir tipagem nominal.
 * Útil para Value Objects como Email, CPF, ID, etc.
 *
 * @example
 * ```typescript
 * type Email = Branded<string, "Email">;
 * const myEmail = "test@test.com" as Email;
 * ```
 */
export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

/**
 * Torna um tipo recursivamente imutável.
 * Diferente do `Readonly<T>` nativo, este aplica a imutabilidade em toda a árvore de propriedades.
 */
export type DeepReadonly<T> = T extends (infer R)[]
	? ReadonlyArray<DeepReadonly<R>>
	: T extends (...args: never[]) => unknown
		? T
		: T extends object
			? { readonly [K in keyof T]: DeepReadonly<T[K]> }
			: T;
