declare module "bun:test" {
  type TestHandler = () => void | Promise<void>;
  type EachTable = {
    <T extends readonly unknown[]>(
      cases: readonly T[],
    ): (name: string, handler: (...args: T) => void | Promise<void>) => void;
    <T>(
      cases: readonly T[],
    ): (name: string, handler: (value: T) => void | Promise<void>) => void;
  };

  interface Describe {
    (name: string, handler: TestHandler): void;
    each: EachTable;
  }

  interface TestFn {
    (name: string, handler: TestHandler): void;
    each: EachTable;
  }

  export const describe: Describe;
  export const test: TestFn;
  export const it: TestFn;

  export function beforeEach(handler: TestHandler): void;
  export function afterEach(handler: TestHandler): void;
  export function beforeAll(handler: TestHandler): void;
  export function afterAll(handler: TestHandler): void;

  interface BaseMatchers<T> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(times: number): void;
    toHaveBeenCalledWith(...args: any[]): void;
    toContain(expected: unknown): void;
    toThrow(error?: string | RegExp | Error): void;
    toBeDefined(): void;
    toBeUndefined(): void;
  }

  interface Matchers<T> extends BaseMatchers<T> {
    not: BaseMatchers<T>;
  }

  export function expect<T = unknown>(actual: T): Matchers<T>;

  type MockFunction<TArgs extends any[], TReturn> = (
    ...args: TArgs
  ) => TReturn;

  export function mock<TArgs extends any[], TReturn>(
    implementation?: (...args: TArgs) => TReturn,
  ): MockFunction<TArgs, TReturn>;

  export interface SpyInstance<TArgs extends any[] = any[], TReturn = any>
    extends MockFunction<TArgs, TReturn> {
    mockRestore(): void;
    mockImplementation(fn: (...args: TArgs) => TReturn): this;
    mockClear(): void;
  }

  export function spyOn<T extends object, K extends keyof T>(
    obj: T,
    method: K,
  ): T[K] extends (...args: infer A) => infer R ? SpyInstance<A, R> : never;
}
