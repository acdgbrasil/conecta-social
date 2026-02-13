# [TASK-044] Hardening e Semântica HTTP (Controllers)

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `bug`, `interface`, `stabilization`
**Origem:** Derivadas do PR #193 (`PR193-TODO-01`, `02`, `14`)

## Descrição
Corrigir bug de concorrência (await ausente) e padronizar o tratamento de erros HTTP para evitar vazamento de dados internos.

## Tarefas
- [ ] Corrigir `await` ausente em `register-appointment.controller` para garantir leitura correta de `c.req.valid("json")`.
- [ ] Remover vazamento de mensagens internas em erros e padronizar status por `error.http ?? 422`.
- [ ] Limpeza de consistência: remover import não usado e alinhar alias de `DomainError` ao padrão.

## Critérios de Aceite
- [ ] Testes de integração validando o payload de erro sem mensagens internas sensíveis.
- [ ] Controller de Appointment aguardando corretamente o parse do JSON.
