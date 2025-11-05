export function pipe<T>(value: T, ...fns: Array<(input: T) => T>): T;
export function pipe<T, R>(value: T, ...fns: Array<(input: any) => any>): R;
export function pipe(value: unknown, ...fns: Array<(input: unknown) => unknown>) {
  return fns.reduce((current, transform) => transform(current), value);
}
