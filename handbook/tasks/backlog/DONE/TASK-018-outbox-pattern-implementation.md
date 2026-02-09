# [TASK-018] Implementar Outbox Pattern para Eventos

**Status:** ✅ Done
**Prioridade:** 🟡 Média
**Labels:** `arch`, `infra`
**Origem:** Audit Code Review 09/01/2026

## Descrição
Garantir a consistência eventual entre a persistência do Agregado e a publicação de eventos. Se o banco de dados falhar após a publicação, ou vice-versa, o sistema entra em estado inconsistente.

## Tarefas
- [x] Criar uma tabela de `outbox_events`.
- [x] Envolver a persistência do Agregado e a escrita no Outbox na mesma transação SQL.
- [x] Criar um background worker para processar o Outbox.

## Critérios de Aceite
- [x] Publicação confiável de eventos (At-least-once delivery).
