export type ImutableList<T> = {
  add: (element: T) => ImutableList<T>;
  remove: (element: T) => ImutableList<T>;
  getAll: () => T[];
  isEmpty: () => boolean;
  count: () => number;
  contains: (element: T) => boolean;
  empty: () => ImutableList<T>;
  castTolist: (list: ImutableList<T>) => ImutableList<T>;
  setUnique: () => ImutableList<T>;
};