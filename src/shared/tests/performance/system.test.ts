import { describe, test, expect } from "bun:test";
import { heapStats } from "bun:jsc";
import { List } from "@conecta/fn";

/**
 * Teste de Sistema e Restrição de Recursos.
 * Objetivo: Monitorar o uso de memória (Heap) durante operações intensivas.
 */
describe("System: Resource Consumption", () => {
  test("deve manter o heap sob controle durante criação massiva", () => {
    const initialHeap = heapStats().heapSize;
    
    // Simula criação de 50.000 itens
    const data = Array.from({ length: 50000 }, (_, i) => ({ id: i, data: "test-content-heavy" }));
    const list = List.from(data);
    
    const finalHeap = heapStats().heapSize;
    const diffMb = (finalHeap - initialHeap) / 1024 / 1024;

    console.log(`
[System Metrics - Memory]`);
    console.log(`Initial Heap: ${(initialHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Final Heap  : ${(finalHeap / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Consumption : ${diffMb.toFixed(2)}MB`);

    // Para 50k objetos simples, não deveríamos passar de 50MB de consumo extra
    expect(diffMb).toBeLessThan(50);
    expect(List.count(list)).toBe(50000);
  });
});
