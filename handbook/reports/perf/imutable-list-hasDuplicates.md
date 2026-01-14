# Plano de análise — `ImutableList.hasDuplicates`

## Objetivo
Demonstrar empiricamente que o algoritmo atual de detecção de duplicados cresce em `O(n * m)` (n = quantidade de elementos, m = custo médio de serialização) e avaliar o ponto em que ele deixa de ser aceitável para coleções do domínio social-care.

## Hipóteses
1. O `stableStringify` é o gargalo dominante devido à ordenação de chaves e controle de ciclos.
2. Para listas com mais de ~200 itens complexos, o custo começa a competir com regras de domínio síncronas.
3. Objetos primitivos (string/number) sofrem bem menos e podem ser tratados com fast-path específica.

## Estratégia de teste
1. **Benchmarks sintéticos**  
   - Script criado em `packages/shared/tests/perf/imutable-list.hasDuplicates.perf.test.ts`.  
   - Listas com tamanhos 10, 50, 100, 250, 500, 1k.  
   - Três formatos: primitivos, objetos rasos, objetos aninhados (último item com referência circular para exercitar `stableStringify`).  
   - Mede `performance.now()` antes/depois e imprime resumo no console (média/desvio padrão).  
2. **Teste estatístico (a ajustar)**  
   - A asserção atual só garante execução (`mean >= 0`). Ajustar threshold local (ex.: `mean < 10ms` para 500 rasos) quando tivermos baseline confiável.  
3. **Prova informal**  
   - Documentar no README dos testes a derivação `O(n * m)` explicando que `stableStringify` percorre cada item inteiro, e que cada chave pode ser ordenada (`O(k log k)` onde k é nº de chaves do objeto).  
   - Conectar isso com os resultados empíricos.

## Métricas a coletar
- Tempo médio e desvio padrão por combinação (tipo de dado x tamanho).
- Quantidade de alocações (pode usar `globalThis.gc` + `process.memoryUsage` para observar tendências).

## Critérios de aceite
- Valores documentados em tabela + gráfico simples no próprio relatório.  
- Threshold definido para rodadas futuras de regressão.  
- Lista de melhorias candidatas (cache por referência, early-return para primitivos).

## Status
- [x] Script de benchmark criado (`packages/shared/tests/perf/imutable-list.hasDuplicates.perf.test.ts`).
- [x] Execução local realizada (Bun v1.3.1) — ver tabela abaixo.
- [x] Thresholds iniciais aplicados no teste (primitivo ≤2ms, raso ≤3ms, aninhado ≤5ms por caso) com override via env (`IMUTABLE_LIST_PERF_THRESHOLD_*`).
- [x] Fast-path para primitivos/Date em `hasDuplicates`/`findDuplicates` usando hash leve antes do `stableStringify`.
- [ ] Explorar otimizações adicionais (cache por referência, early-return para combinações mistas).

## Resultados (Bun v1.3.1, execução local)

| tipo      | tamanho | mean (ms) | std (ms) |
| --------- | ------- | --------- | -------- |
| primitivo | 10      | 0.019     | 0.030    |
| raso      | 10      | 0.407     | 0.887    |
| aninhado  | 10      | 0.101     | 0.209    |
| primitivo | 50      | 0.015     | 0.002    |
| raso      | 50      | 0.060     | 0.019    |
| aninhado  | 50      | 0.127     | 0.005    |
| primitivo | 100     | 0.032     | 0.003    |
| raso      | 100     | 0.113     | 0.004    |
| aninhado  | 100     | 0.257     | 0.012    |
| primitivo | 250     | 0.076     | 0.004    |
| raso      | 250     | 0.305     | 0.071    |
| aninhado  | 250     | 0.407     | 0.054    |
| primitivo | 500     | 0.097     | 0.002    |
| raso      | 500     | 0.348     | 0.015    |
| aninhado  | 500     | 0.739     | 0.022    |
| primitivo | 1000    | 0.265     | 0.220    |
| raso      | 1000    | 0.686     | 0.014    |
| aninhado  | 1000    | 1.463     | 0.051    |

Observação: std alto em `raso-10` sugere ruído do ambiente; thresholds devem considerar hardware/variância local.

## Próximos passos
- Implementar script de benchmark em `packages/shared/tests/perf/imutable-list.hasDuplicates.perf.ts`.  
- Integrar no CI como job opcional quando alguém tocar no `fn-pattern`.  
- Explorar alternativa baseada em `Set` com `JSON.stringify` cacheado por referência e comparar.
