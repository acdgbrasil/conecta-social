import { describe, test, expect } from "bun:test";
import { List } from "@conecta/fn";

/**
 * Teste de Complexidade Algorítmica.
 * Objetivo: Validar se a performance escala linearmente O(n).
 */
describe("Complexity: List.unique", () => {
  const measure = (size: number) => {
    const data = Array.from({ length: size }, (_, i) => i);
    
    const start = Bun.nanoseconds();
    List.unique(data);
    const end = Bun.nanoseconds();
    
    return end - start;
  };

  test("deve escalar linearmente (O(n))", () => {
    const time100 = measure(100);
    const time1000 = measure(1000);
    const time10000 = measure(10000);

    console.log(`
[Complexity Metrics - List.unique]`);
    console.log(`N=100   : ${(time100 / 1e6).toFixed(4)}ms`);
    console.log(`N=1000  : ${(time1000 / 1e6).toFixed(4)}ms`);
    console.log(`N=10000 : ${(time10000 / 1e6).toFixed(4)}ms`);

    // Validação de sanidade: N=10000 não deve ser drasticamente maior que 100x o tempo de N=100
    // (Damos uma margem de folga para o JIT warming up)
    const ratio = time10000 / time100;
    expect(ratio).toBeLessThan(500); // Se fosse O(n^2) seria > 10000
  });
});
