declare module "bun:test" {
  type TestHandler = () => void | Promise<void>;

  export function describe(name: string, handler: TestHandler): void;
  export function describe.each<T extends readonly unknown[]>(
    cases: readonly T[],
  ): (name: string, handler: (...args: T) => void | Promise<void>) => void;

  export function test(name: string, handler: TestHandler): void;
  export function it(name: string, handler: TestHandler): void;
  export function beforeEach(handler: TestHandler): void;
  export function afterEach(handler: TestHandler): void;
  export function beforeAll(handler: TestHandler): void;
  export function afterAll(handler: TestHandler): void;

  interface Matchers<T> {
    [matcher: string]: (...args: any[]) => any;
  }

  export function expect<T = unknown>(actual: T): Matchers<T>;

  export function mock<TArgs extends any[], TReturn>(
    implementation?: (...args: TArgs) => TReturn,
  ): (...args: TArgs) => TReturn;
}
