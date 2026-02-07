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

    test("deve compor funções síncronas corretamente (number -> number)", () => {
    const add5 = (n: number) => n + 5;
    const double = (n: number) => n * 2;
    
    // 10 + 5 = 15 -> 15 * 2 = 30
    const result = pipe(10, add5, double);
    
    expect(result).toBe(30);
  });

  test("deve suportar transformação de tipos (number -> string -> boolean)", () => {
    const numToCurrency = (n: number) => `R$ ${n.toFixed(2)}`;
    const isExpensive = (s: string) => parseFloat(s.replace("R$ ", "")) > 50;

    // 100 -> "R$ 100.00" -> true
    const result = pipe(100, numToCurrency, isExpensive);
    
    expect(result).toBe(true);
    expect(typeof result).toBe("boolean");
  });

  test("não deve mutar o valor inicial se as funções forem puras", () => {
    const original = { count: 1 };
    
    // Função pura que retorna um novo objeto
    const increment = (obj: typeof original) => ({ count: obj.count + 1 });
    
    const result = pipe(original, increment);
    
    expect(result.count).toBe(2);
    expect(original.count).toBe(1); // Garante que a referência original não foi tocada
  });

  test("deve funcionar com uma única função", () => {
    const trim = (s: string) => s.trim();
    expect(pipe("  bun  ", trim)).toBe("bun");
  });
});
