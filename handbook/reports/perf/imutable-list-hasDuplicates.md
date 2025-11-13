# Plano de análise — `ImutableList.hasDuplicates`

## Objetivo
Demonstrar empiricamente que o algoritmo atual de detecção de duplicados cresce em `O(n * m)` (n = quantidade de elementos, m = custo médio de serialização) e avaliar o ponto em que ele deixa de ser aceitável para coleções do domínio social-care.

## Hipóteses
1. O `stableStringify` é o gargalo dominante devido à ordenação de chaves e controle de ciclos.
2. Para listas com mais de ~200 itens complexos, o custo começa a competir com regras de domínio síncronas.
3. Objetos primitivos (string/number) sofrem bem menos e podem ser tratados com fast-path específica.

## Estratégia de teste
1. **Benchmarks sintéticos**  
   - Criar script (`bun test --filter hasDuplicates-perf`) que monta listas com tamanhos 10, 50, 100, 250, 500, 1k.  
   - Reutilizar 3 formatos: primitivos, objetos rasos, objetos aninhados com referências circulares.  
   - Medir `performance.now()` antes/depois da chamada para estimar ms por execução.
2. **Teste estatístico (RED)`**  
   - Escrever teste que falha se o tempo médio para listas rasas de 500 itens exceder 10ms em hardware local (valor para calibrar).  
   - Depois otimizar/ajustar ou alterar o threshold baseado nos benchmarks.
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

## Próximos passos
- Implementar script de benchmark em `packages/shared/tests/perf/imutable-list.hasDuplicates.perf.ts`.  
- Integrar no CI como job opcional quando alguém tocar no `fn-pattern`.  
- Explorar alternativa baseada em `Set` com `JSON.stringify` cacheado por referência e comparar.
