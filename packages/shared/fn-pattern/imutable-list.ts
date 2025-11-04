import { None } from "src";
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
    setUnique: () => imutableList<T>(Array.from(new Set(elements)))

  };
}

export const ImutableListFactory = {
  empty: <T>() => imutableList<T>([]),
  fromArray: <T>(elements: T[]) => imutableList<T>(elements),
  castTolist: <T>(list: ImutableListType<T>) => imutableList<T>(list.getAll() as T[]),
};
