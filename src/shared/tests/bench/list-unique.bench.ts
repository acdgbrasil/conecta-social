import { bench, group } from "bun:test";
import { List } from "@conecta/fn";

/**
 * Benchmark de Complexidade para List.unique.
 * Objetivo: Validar a performance O(n) e garantir que o uso de Set 
 * escala linearmente conforme o tamanho da lista aumenta.
 * 
 * Como rodar: `bun bench src/shared/tests/bench/list-unique.bench.ts`
 */

// Massa de dados para teste
const createData = (size: number) => Array.from({ length: size }, (_, i) => i);

const data10 = createData(10);
const data100 = createData(100);
const data1000 = createData(1000);
const data10000 = createData(10000);

group("List.unique (Primitives)", () => {
  bench("10 elements", () => {
    List.unique(data10);
  });

  bench("100 elements", () => {
    List.unique(data100);
  });

  bench("1,000 elements", () => {
    List.unique(data1000);
  });

  bench("10,000 elements", () => {
    List.unique(data10000);
  });
});

group("List.unique (Complex Objects with keySelector)", () => {
  const objects = (size: number) => Array.from({ length: size }, (_, i) => ({ id: i, data: "test" }));
  
  const obj100 = objects(100);
  const obj1000 = objects(1000);

  bench("100 objects", () => {
    List.unique(obj100, (o) => o.id);
  });

  bench("1,000 objects", () => {
    List.unique(obj1000, (o) => o.id);
  });
});
