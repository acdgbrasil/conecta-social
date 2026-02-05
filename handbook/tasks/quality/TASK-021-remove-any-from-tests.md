# [TASK-021] Remover any dos Testes Unitários

**Status:** 📁 Backlog
**Prioridade:** 🟡 Média
**Labels:** `quality`, `test`
**Origem:** Audit Code Review 09/01/2026

## Descrição
Diversos testes utilizam `as any` para burlar o sistema de tipos ou acessar métodos privados. Isso fragiliza a suíte de testes.

## Tarefas
- [ ] Mapear arquivos com `any`.
- [ ] Refatorar para usar interfaces reais ou Mocks tipados.

## Critérios de Aceite
- [ ] Zero ocorrências de `as any` em `src/modules/*/application/tests`.
