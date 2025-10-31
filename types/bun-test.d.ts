declare module "bun:test" {
  type TestFn = () => void | Promise<void>;

  interface TestAPI {
    (name: string, fn: TestFn): void;
    skip(name: string, fn?: TestFn): void;
    only(name: string, fn: TestFn): void;
    todo(name: string): void;
  }

  export const describe: TestAPI;
  export const it: TestAPI;
  export const test: TestAPI;

  interface Matchers {
    toBe<T>(expected: T): void;
    toEqual(expected: unknown): void;
    toMatch(expected: string | RegExp): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toThrow(expected?: string | RegExp | ErrorConstructor): void;
    toContain(item: unknown): void;
    toHaveLength(length: number): void;
  }

  export interface Expectation extends Matchers {
    not: Matchers;
  }

  export function expect<T>(actual: T): Expectation;

  export function beforeEach(fn: TestFn): void;
  export function afterEach(fn: TestFn): void;
  export function beforeAll(fn: TestFn): void;
  export function afterAll(fn: TestFn): void;
}
