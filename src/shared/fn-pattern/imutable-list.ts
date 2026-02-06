export type ImutableList<T> = readonly T[];

const clone = <T>(list: ImutableList<T>): readonly T[] => [...list];

const add = <T>(list: ImutableList<T>, element: T): ImutableList<T> => [...list, element];
const remove = <T>(list: ImutableList<T>, element: T): ImutableList<T> => list.filter((candidate) => candidate !== element);
const getAll = <T>(list: ImutableList<T>): T[] => [...list];
const isEmpty = <T>(list: ImutableList<T>): boolean => list.length === 0;
const count = <T>(list: ImutableList<T>): number => list.length;
const contains = <T>(list: ImutableList<T>, element: T): boolean => list.includes(element);
const empty = <T>(): ImutableList<T> => [] as const;
const fromArray = <T>(elements: readonly T[]): ImutableList<T> => [...elements];
const castTolist = <T>(list: ImutableList<T>): ImutableList<T> => [...list];
const setUnique = <T>(list: ImutableList<T>): ImutableList<T> => {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of list) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
};

function stableStringify(value: any): string {
  const cache = new Set<any>();

  const replacer = (_key: string, val: any) => {
    if (typeof val === "object" && val !== null) {
      if (cache.has(val)) return "[Circular]";
      cache.add(val);
    }

    if (Array.isArray(val)) return val;
    if (val && typeof val === "object" && !(val instanceof Date)) {
      const ordered: any = {};
      Object.keys(val)
        .sort()
        .forEach((k) => (ordered[k] = (val as any)[k]));
      return ordered;
    }
    return val;
  };

  return JSON.stringify(value, replacer);
}

function hashValue(value: unknown): string {
  if (value === null) return "p:null";
  const type = typeof value;
  switch (type) {
    case "undefined":
      return "p:undefined";
    case "string":
      return `p:string:${value as string}`;
    case "number":
      return `p:number:${value as number}`;
    case "boolean":
      return `p:boolean:${value as boolean}`;
    case "bigint":
      return `p:bigint:${value.toString()}`;
    case "symbol":
      return `p:symbol:${String(value)}`;
  }

  if (value instanceof Date) return `d:${value.toISOString()}`;
  return stableStringify(value as any);
}

const hasDuplicates = <T>(list: ImutableList<T>): boolean => {
  const seen = new Set<string>();
  for (const item of list) {
    const hash = hashValue(item);
    if (seen.has(hash)) return true;
    seen.add(hash);
  }
  return false;
};

const findDuplicates = <T>(list: ImutableList<T>): T[] => {
  const seen = new Map<string, T>();
  const duplicates: T[] = [];
  for (const item of list) {
    const hash = hashValue(item);
    if (seen.has(hash)) {
      if (!duplicates.includes(item)) duplicates.push(item);
    } else {
      seen.set(hash, item);
    }
  }
  return duplicates;
};

/**
 * Compat layer preservando API ImutableListFactory, mas usando readonly arrays.
 */
export const ImutableListFactory = {
  empty,
  fromArray,
  castTolist,
  add: <T>(list: ImutableList<T>, element: T) => add(list, element),
  remove: <T>(list: ImutableList<T>, element: T) => remove(list, element),
  getAll: <T>(list: ImutableList<T>) => getAll(list),
  isEmpty: <T>(list: ImutableList<T>) => isEmpty(list),
  count: <T>(list: ImutableList<T>) => count(list),
  contains: <T>(list: ImutableList<T>, element: T) => contains(list, element),
  setUnique: <T>(list: ImutableList<T>) => setUnique(list),
  hasDuplicates: <T>(list: ImutableList<T>) => hasDuplicates(list),
  findDuplicates: <T>(list: ImutableList<T>) => findDuplicates(list),
};

export { stableStringify };
