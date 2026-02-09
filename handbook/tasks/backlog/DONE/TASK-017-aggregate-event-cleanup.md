# [TASK-017] Implementar Limpeza de Eventos no Agregado

**Status:** ✅ Done
**Prioridade:** 🔵 Baixa
**Labels:** `refactor`, `domain`
**Origem:** Audit Code Review 09/01/2026

## Descrição
Atualmente, o método `pullDomainEvents` retorna a lista de eventos, mas não há um mecanismo explícito para limpá-los. Embora a imutabilidade proteja contra alguns bugs, em fluxos de longa duração onde o agregado é reaproveitado, isso pode causar duplicidade.

## Tarefas
- [x] Implementar `clearDomainEvents()` e garantir que `pullDomainEvents` retorne uma cópia limpa.

## Critérios de Aceite
- [x] Sem duplicidade de eventos em testes de salvamento sequencial.
