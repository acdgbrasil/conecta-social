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
    /**
     * Detecta duplicatas calculando um hash estrutural determinístico para cada item.
     * A estratégia considera igualdade profunda (ordena chaves e trata ciclos) e
     * possui custo aproximado O(n * m), onde `m` é o custo de serialização de cada elemento.
     * Ideal para coleções pequenas do domínio; para listas extensas considere alternativas com hashing incremental.
     */
    hasDuplicates: () => {
      const vistos = new Set<string>();
      for (const item of elements) {
        const hash = stableStringify(item);

        if (vistos.has(hash)) {
          return true;               // duplicata encontrada
        }
        vistos.add(hash);
      }
      return false;                  // nenhum duplicado
    },
    findDuplicates: () => {
      const vistos = new Map<string, T>();
      const duplicatas: T[] = [];

      for (const item of elements) {
        const hash = stableStringify(item);

        if (vistos.has(hash)) {
          // Adiciona à lista de duplicatas se ainda não estiver presente
          if (!duplicatas.includes(item)) {
            duplicatas.push(item);
          }
        } else {
          vistos.set(hash, item);
        }
      }

      return duplicatas;
    },

  };
}

export const ImutableListFactory = {
  empty: <T>() => imutableList<T>([]),
  fromArray: <T>(elements: T[]) => imutableList<T>(elements),
  castTolist: <T>(list: ImutableListType<T>) => imutableList<T>(list.getAll() as T[]),
};

/**
 * Serializa valores em uma string estável para permitir comparações estruturais.
 * - Ordena chaves de objetos para evitar falsos negativos.
 * - Marca referências cíclicas como "[Circular]" para evitar loops infinitos.
 * Esse processo é custoso (JSON.stringify + ordenação a cada elemento), e deve ser
 * monitorado em coleções grandes. Futuras otimizações podem incluir cache por referência
 * ou caminhos especializados para tipos primitivos.
 */
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
