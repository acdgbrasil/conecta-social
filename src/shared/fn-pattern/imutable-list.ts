export type ImutableList<T> = readonly T[];

// --- Constructors ---

const empty = <T>(): ImutableList<T> => [];

const of = <T>(...elements: T[]): ImutableList<T> => elements;

const from = <T>(iterable: Iterable<T>): ImutableList<T> =>
	Array.from(iterable);

// --- Operations (Pure & Immutable) ---

const add = <T>(list: ImutableList<T>, element: T): ImutableList<T> => [
	...list,
	element,
];

const remove = <T>(list: ImutableList<T>, element: T): ImutableList<T> =>
	list.filter((e) => e !== element);

const map = <T, U>(
	list: ImutableList<T>,
	fn: (item: T) => U,
): ImutableList<U> => list.map(fn);

const filter = <T>(
	list: ImutableList<T>,
	predicate: (item: T) => boolean,
): ImutableList<T> => list.filter(predicate);

// --- Queries ---

const isEmpty = <T>(list: ImutableList<T>): boolean => list.length === 0;

const count = <T>(list: ImutableList<T>): number => list.length;

const has = <T>(list: ImutableList<T>, element: T): boolean =>
	list.includes(element);

/**
 * Retorna uma nova lista sem duplicatas.
 * Para primitivos, usa Set (O(n)).
 * Para objetos, aceita uma função seletora de chave opcional. Se não fornecida, usa referência.
 */
const unique = <T, K = T>(
	list: ImutableList<T>,
	keySelector?: (item: T) => K,
): ImutableList<T> => {
	if (!keySelector) return Array.from(new Set(list));

	const seen = new Set<K>();
	return list.filter((item) => {
		const key = keySelector(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};

/**
 * Verifica se existem duplicatas na lista.
 * Otimizado para falhar rápido (early return).
 */
const hasDuplicates = <T, K = T>(
	list: ImutableList<T>,
	keySelector?: (item: T) => K,
): boolean => {
	const seen = new Set<K>();
	for (const item of list) {
		const key = keySelector ? keySelector(item) : (item as unknown as K);
		if (seen.has(key)) return true;
		seen.add(key);
	}
	return false;
};

// --- Namespace ---

export const List = {
	empty,
	of,
	from,
	add,
	remove,
	isEmpty,
	count,
	has,
	map,
	filter,
	unique,
	hasDuplicates,
	toArray: <T>(list: ImutableList<T>): T[] => [...list],
};
