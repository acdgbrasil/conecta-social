# [TASK-022] Integrar Benchmarks de ImutableList no CI

**Status:** ✅ Done
**Prioridade:** 🔵 Baixa
**Labels:** `perf`, `ci`
**Origem:** Relatório de Refatoração 14/11/2025

## Descrição
Garantir que a performance da detecção de duplicados em `ImutableList` não degrade em grandes coleções.

## Tarefas
- [x] Criar threshold automático para os testes de performance.
- [x] Rodar benchmarks em cada merge para o `main`.

## Critérios de Aceite
- [x] O pipeline falha se o benchmark exceder o tempo limite.
