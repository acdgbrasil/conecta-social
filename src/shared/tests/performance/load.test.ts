import { describe, test, expect } from "bun:test";

/**
 * Teste de Carga (Load Test).
 * Objetivo: Medir requisições por segundo (RPS) em um cenário de estresse.
 */
describe("Load: Concurrent Requests", () => {
  test("deve processar requisições concorrentes com baixo tempo de resposta", async () => {
    // 1. Levanta um servidor ultra rápido para o teste
    const server = Bun.serve({
      port: 0, // Porta aleatória livre
      fetch() {
        return new Response("OK");
      },
    });

    const url = `http://${server.hostname}:${server.port}`;
    const TOTAL_REQUESTS = 1000;
    const CONCURRENCY = 50;

    const start = Bun.nanoseconds();
    
    // 2. Dispara requisições em chunks de concorrência
    for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
      const requests = Array.from({ length: CONCURRENCY }, () => fetch(url));
      await Promise.all(requests);
    }

    const end = Bun.nanoseconds();
    const durationMs = (end - start) / 1e6;
    const rps = (TOTAL_REQUESTS / durationMs) * 1000;

    console.log(`
[Load Metrics]`);
    console.log(`Total Req : ${TOTAL_REQUESTS}`);
    console.log(`Duration  : ${durationMs.toFixed(2)}ms`);
    console.log(`Throughput: ${rps.toFixed(0)} requests/sec`);

    server.stop();

    expect(rps).toBeGreaterThan(100); // Mínimo aceitável localmente
  });
});
