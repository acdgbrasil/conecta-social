import { ImutableList as ImutableListType } from "./fn-types";

function imutableList<T>(elements: T[]): ImutableListType<T> {
  return {
    add: (element: T) => imutableList([...elements, element]),
    remove: (element: T) => imutableList(elements.filter((candidate) => candidate !== element)),
    getAll: () => [...elements],
    isEmpty: () => elements.length === 0,
    count: () => elements.length,
    contains: (element: T) => elements.includes(element),
    empty: () => imutableList<T>([]),
    castTolist: (list: ImutableListType<T>) => imutableList<T>(list.getAll() as T[]),
    setUnique: () => imutableList<T>(elements.reduce((acc: T[], curr: T) => {
      if (!acc.includes(curr)) {
        acc.push(curr);
      }
      return acc;
    }, [])),
    hasDuplicates: () => {
      const vistos = new Set<string>();
      for (const item of elements) {
        // Converte o item para uma string única que reflita sua estrutura.
        // JSON.stringify trata bem objetos simples, mas precisamos garantir
        // ordem estável das propriedades para objetos cujas chaves não são
        // garantidas em ordem.  A função `stableStringify` resolve isso.
        const hash = stableStringify(item);

        if (vistos.has(hash)) {
          return true;               // duplicata encontrada
        }
        vistos.add(hash);
      }
      return false;                  // nenhum duplicado
    }
  };
}

export const ImutableListFactory = {
  empty: <T>() => imutableList<T>([]),
  fromArray: <T>(elements: T[]) => imutableList<T>(elements),
  castTolist: <T>(list: ImutableListType<T>) => imutableList<T>(list.getAll() as T[]),
};

function stableStringify(value: any): string {
  const cache = new Set<any>();

  const replacer = (_key: string, val: any) => {
    // Detecta ciclos (ex.: objeto que referencia a si mesmo)
    if (typeof val === 'object' && val !== null) {
      if (cache.has(val)) {
        // Representa ciclos de forma determinística
        return '[Circular]';
      }
      cache.add(val);
    }

    // Ordena as chaves de objetos para garantir que
    // {a:1,b:2} e {b:2,a:1} produzam o mesmo hash.
    if (Array.isArray(val)) {
      return val;
    }
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      const ordered: any = {};
      Object.keys(val)
        .sort()
        .forEach(k => (ordered[k] = (val as any)[k]));
      return ordered;
    }
    return val;
  };

  return JSON.stringify(value, replacer);
}
