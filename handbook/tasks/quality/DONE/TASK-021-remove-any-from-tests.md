# [TASK-021] Remover any dos Testes Unitários

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `quality`, `test`
**Origem:** Audit Code Review 09/01/2026

## Descrição
Diversos testes utilizam `as any` para burlar o sistema de tipos ou acessar métodos privados. Isso fragiliza a suíte de testes.

## Tarefas
- [x] Mapear arquivos com `any`.
- [x] Refatorar para usar interfaces reais ou Mocks tipados.

## Critérios de Aceite
- [x] Zero ocorrências de `as any` em `src/modules/*/application/tests`.
