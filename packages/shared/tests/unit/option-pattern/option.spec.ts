import { describe, expect, test } from "bun:test";
import { Some, None } from "@conecta/option";

describe("Option", () => {
  test("Some encapsula valor com flags corretas", () => {
    const option = Some("valor");

    expect(option.isSome).toBe(true);
    expect(option.isNone).toBe(false);
    expect(option.kind).toBe("some");
    expect(option.map((v) => v.toUpperCase()).unwrap()).toBe("VALOR");
  });

  test("None representa ausência de valor", () => {
    const option = None();

    expect(option.isSome).toBe(false);
    expect(option.isNone).toBe(true);
    expect("value" in option).toBe(false);
    expect(option.kind).toBe("none");
    expect(option.map(() => {}).isNone).toBe(true);
    expect(() => option.unwrap()).toThrowError("Cannot unwrap value from None");
  });

  test("unwrap e unwrapOr respeitam presença ou ausência de valor", () => {
    const some = Some(42);
    expect(some.unwrap()).toBe(42);
    expect(some.unwrapOr(0)).toBe(42);

    const none = None<number>();
    expect(none.unwrapOr(7)).toBe(7);
    expect(() => none.unwrap()).toThrowError("Cannot unwrap value from None");
  });
  
});
