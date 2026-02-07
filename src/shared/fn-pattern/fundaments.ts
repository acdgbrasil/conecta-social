/**
 * Representa uma função unária em um pipeline.
 * T: Tipo de entrada
 * R: Tipo de saída
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: A assinatura de implementação precisa aceitar transformações de tipos genéricos que as sobrecargas já validam. */
export type PipelineFunction<T = any, R = any> = (arg: T) => R;

/**
 * Executa uma composição de funções da esquerda para a direita (pipeline).
 * O valor inicial é passado para a primeira função, o resultado desta para a segunda, e assim por diante.
 *
 * @example
 * ```typescript
 * const result = pipe(
 *   " 10 ",
 *   (s) => s.trim(),    // " 10 " -> "10"
 *   (s) => parseInt(s), // "10"   -> 10
 *   (n) => n * 2        // 10     -> 20
 * );
 * // result é 20
 * ```
 *
 * @param initialValue - O valor inicial que entrará no pipeline.
 * @param fn1 - A primeira função de transformação.
 * @returns O resultado final após todas as transformações.
 *
 * @performance
 * Utiliza um loop `for` otimizado para minimizar o overhead de execução no Bun (JSC).
 *
 * @immutability
 * Garante imutabilidade referencial; o `initialValue` nunca é modificado.
 */
export function pipe<A, B>(initialValue: A, fn1: (arg: A) => B): B;
export function pipe<A, B, C>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
): C;
export function pipe<A, B, C, D>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
): D;
export function pipe<A, B, C, D, E>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
	fn4: (arg: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
	fn4: (arg: D) => E,
	fn5: (arg: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
	fn4: (arg: D) => E,
	fn5: (arg: E) => F,
	fn6: (arg: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
	fn4: (arg: D) => E,
	fn5: (arg: E) => F,
	fn6: (arg: F) => G,
	fn7: (arg: G) => H,
): H;
export function pipe<A, B, C, D, E, F, G, H, I>(
	initialValue: A,
	fn1: (arg: A) => B,
	fn2: (arg: B) => C,
	fn3: (arg: C) => D,
	fn4: (arg: D) => E,
	fn5: (arg: E) => F,
	fn6: (arg: F) => G,
	fn7: (arg: G) => H,
	fn8: (arg: H) => I,
): I;

/**
 * Implementação do pipe.
 *
 * Imutabilidade:
 * 1. O array de funções é `readonly` para garantir que o pipeline não seja alterado.
 * 2. Usamos uma variável local `acc` para acumular o resultado, preservando a referência de `initialValue` intacta.
 * 3. A assinatura de retorno é `any` (ou unknown) na implementação para permitir a transformação de tipos (A -> B -> C),
 *    enquanto as sobrecargas acima garantem a segurança de tipos para o consumidor.
 */
export function pipe(
	initialValue: unknown,
	...fns: readonly PipelineFunction[]
): unknown {
	let acc = initialValue;
	for (const fn of fns) {
		acc = fn(acc);
	}
	return acc;
}

/**
 * Transforma uma função de múltiplos argumentos em uma sequência de funções curried.
 * Suporta funções de aridade 2 e 3 com tipagem completa.
 *
 * @example
 * ```typescript
 * const add = curry((a: number, b: number) => a + b);
 * const add5 = add(5);
 * const result = add5(10); // 15
 * ```
 */
export function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R;
export function curry<A, B, C, R>(
	fn: (a: A, b: B, c: C) => R,
): (a: A) => (b: B) => (c: C) => R;

export function curry(fn: (...args: any[]) => any): any {
	return function curried(this: any, ...args: any[]) {
		if (args.length >= fn.length) {
			return fn.apply(this, args);
		}
		return (...args2: any[]) => {
			return curried.apply(this, args.concat(args2));
		};
	};
}
