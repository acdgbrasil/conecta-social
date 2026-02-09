import { describe, expect, test } from "bun:test";
import { List } from "../../fn-pattern/imutable-list";

describe("Full Concurrency & Starvation Analysis (All Ops)", () => {
  
  const SIZE = 500_000;
  const baseList = List.from(Array.from({ length: SIZE }, (_, i) => i));

  // CENÁRIO 1: Integridade de todas as operações sob concorrência
  test("Integrity Attack: Todas as operações rodando simultaneamente", async () => {
    // eslint-disable-next-line no-console
    console.log(`\n[Integrity] Iniciando ataque massivo em todas as operações (N=${SIZE.toLocaleString()})...`);

    const operations = [
      () => List.add(baseList, 999),
      () => List.remove(baseList, 0),
      () => List.map(baseList, x => x * 2),
      () => List.filter(baseList, x => x % 2 === 0),
      () => List.unique(baseList),
      () => List.hasDuplicates(baseList),
      () => List.has(baseList, SIZE - 1),
      () => List.count(baseList),
      () => List.isEmpty(baseList),
      () => List.toArray(baseList),
    ];

    // Disparamos 100 de cada operação simultaneamente (1000 total)
    const promises = Array.from({ length: 100 }).flatMap(() => 
      operations.map(op => Promise.resolve().then(() => op()))
    );

    const results = await Promise.all(promises);

    expect(results.length).toBe(1000);
    expect(List.count(baseList)).toBe(SIZE);
    expect(baseList[0]).toBe(0);
    
    // eslint-disable-next-line no-console
    console.log(`[Integrity] Sucesso! 1000 operações variadas mantiveram a imutabilidade.`);
  }, { timeout: 30000 }); // Aumenta timeout para 30s devido à carga massiva

  // CENÁRIO 2: Starvation em Bateria (Custo acumulado)
  test("Battery Starvation: Bloqueio acumulado de todas as operações O(N)", async () => {
    const STRESS_SIZE = 2_000_000;
    const stressList = List.from(Array.from({ length: STRESS_SIZE }, (_, i) => i % 1000));

    const heartbeats: number[] = [];
    let stop = false;
    const startMonitor = performance.now();
    
    const timer = setInterval(() => {
      if (stop) return;
      heartbeats.push(performance.now() - startMonitor);
    }, 5); // Intervalo curto para detectar micro-bloqueios

    // eslint-disable-next-line no-console
    console.log(`\n[Starvation] Iniciando bateria de operações pesadas (N=${STRESS_SIZE.toLocaleString()})...`);

    const tStart = performance.now();
    
    // Execução sequencial de todas as operações pesadas
    List.from(stressList);      // Re-alloc
    List.map(stressList, x => x); // Transform
    List.filter(stressList, x => true); // Filter
    List.unique(stressList);    // Dedup
    List.hasDuplicates(stressList); // Check
    List.remove(stressList, -1); // Remove
    List.toArray(stressList);   // Export

    const tEnd = performance.now();
    stop = true;
    clearInterval(timer);

    const totalProcessing = tEnd - tStart;
    const expectedBeats = Math.floor(totalProcessing / 5);
    const actualBeats = heartbeats.filter(t => t >= (tStart - startMonitor) && t <= (tEnd - startMonitor)).length;

    // eslint-disable-next-line no-console
    console.log(`[Starvation] Tempo total da bateria: ${totalProcessing.toFixed(2)}ms`);
    // eslint-disable-next-line no-console
    console.log(`[Starvation] Heartbeats durante a bateria (esperados ~${expectedBeats}): ${actualBeats}`);

    // Comprovando o bloqueio do event loop
    expect(actualBeats).toBeLessThanOrEqual(1); // No máximo 1 heartbeat pode escapar por sorte no início/fim
    
    // eslint-disable-next-line no-console
    console.log(`[Starvation] Alerta: O Event Loop ficou paralisado por ${totalProcessing.toFixed(2)}ms.`);
  });
});