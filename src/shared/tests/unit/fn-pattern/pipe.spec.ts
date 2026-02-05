import { describe, expect, test } from "bun:test";
import { pipe } from "@conecta/fn";

describe("pipe", () => {
  test("encadeia transformações sequenciais", () => {
    const result = pipe(
      2,
      (value) => value * 3,
      (value) => value + 5,
    );

    expect(result).toBe(11);
  });

  test("funciona com tipo de retorno diferente", () => {
    const result = pipe(
      "texto",
      (value) => value.length,
      (value) => value > 4,
    );

    expect(result).toBe(true);
  });
});
