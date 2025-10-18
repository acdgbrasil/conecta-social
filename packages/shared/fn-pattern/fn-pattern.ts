export function pipe(x: any, ...fns: Array<(x: any) => any>) {
  return fns.reduce((v, f) => f(v), x);
}