# [TASK-043] Alinhar Governança e Matriz de Eventos do People Context

**Status:** 🔴 To Do
**Prioridade:** 🛡️ Alta
**Labels:** `security`, `docs`, `people-context`
**Origem:** PR #148 review (Kody AI)

## Descrição
A revisão identificou duas inconsistências no handbook do People Context: falta de regra explícita contra autoaprovação em `DataAccessRequest` e ausência de consumidor `AUTH` para `AccountCreated` na matriz de eventos externos.

## Comentários Relacionados (PR #148)
- `handbook/domain_questions/people-context/agregados_entidades.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777225958
- `handbook/domain_questions/people-context/people-events.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777225990

## Tarefas
- [ ] Adicionar regra de negócio proibindo autoaprovação (`requesterId != authorizerId`) com exceções auditadas.
- [ ] Atualizar matriz de consumidores externos para incluir `AUTH` consumindo `AccountCreated`.
- [ ] Revisar consistência entre tabelas e texto narrativo de eventos de identidade.

## Critérios de Aceite
- [ ] Documentação descreve claramente a regra anti-autoaprovação e exceções.
- [ ] Evento `AccountCreated` com consumidor `AUTH` explícito na tabela externa.
