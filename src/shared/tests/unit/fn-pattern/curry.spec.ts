import { describe, expect, test } from "bun:test";
import { curry } from "@conecta/fn";

describe("curry", () => {
  test("suporta aridade 2", () => {
    const sum = (a: number, b: number) => a + b;
    const curried = curry(sum);

    expect(curried(1)(2)).toBe(3);
  });

  test("suporta aridade 3", () => {
    const sum3 = (a: number, b: number, c: number) => a + b + c;
    const curried = curry(sum3);

    expect(curried(1)(2)(3)).toBe(6);
  });
});
