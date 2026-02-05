# [TASK-018] Implementar Outbox Pattern para Eventos

**Status:** 📁 Backlog
**Prioridade:** 🟡 Média
**Labels:** `arch`, `infra`
**Origem:** Audit Code Review 09/01/2026

## Descrição
Garantir a consistência eventual entre a persistência do Agregado e a publicação de eventos. Se o banco de dados falhar após a publicação, ou vice-versa, o sistema entra em estado inconsistente.

## Tarefas
- [ ] Criar uma tabela de `outbox_events`.
- [ ] Envolver a persistência do Agregado e a escrita no Outbox na mesma transação SQL.
- [ ] Criar um background worker para processar o Outbox.

## Critérios de Aceite
- [ ] Publicação confiável de eventos (At-least-once delivery).
