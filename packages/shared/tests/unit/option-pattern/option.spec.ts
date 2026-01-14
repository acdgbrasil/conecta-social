import { describe, expect, test } from "bun:test";
import { None, Some } from "@conecta/option";
import { unSafe } from "@conecta/shared/option-pattern/Option";

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

describe("unSafe factory", () => {
  test("deve retornar Some para valores não nulos e não indefinidos", () => {
    const values = ["string", 42, { a: 1 }, [], true, false, 0, ""];
    values.forEach((value) => {
      const option = unSafe(value);
      expect(option.isSome).toBe(true);
      expect(option.unwrap()).toBe(value);
    });
  });

  test("deve retornar None para valor nulo", () => {
    const option = unSafe(null);
    expect(option.isNone).toBe(true);
  });

  test("deve retornar None para valor indefinido", () => {
    const option = unSafe(undefined);
    expect(option.isNone).toBe(true);
  });

  test("deve inferir o tipo corretamente e retornar Some", () => {
    const value = { id: "123" };
    const option = unSafe(value);
    expect(option.isSome).toBe(true);
    // O tipo de `v` deve ser inferido como `{ id: string }`
    const id = option.map((v) => v.id).unwrapOr("");
    expect(id).toBe("123");
  });

  test("deve retornar None para um tipo que pode ser nulo", () => {
    const value: string | null = null;
    const option = unSafe(value);
    expect(option.isNone).toBe(true);
  });
});
