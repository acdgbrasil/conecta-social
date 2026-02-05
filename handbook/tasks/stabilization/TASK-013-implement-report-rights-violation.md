# [TASK-013] Implementar ReportRightsViolationUseCase

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `feature`, `application`

## Descrição
A implementação atual do UseCase `ReportRightsViolation` lança um erro `Not implemented`.

## Tarefas
- [ ] Implementar o método `execute`.
- [ ] Fluxo: Recuperar `Patient`, chamar `reportRightsViolation` no agregado, salvar e emitir eventos.
- [ ] Garantir que o `victimId` seja validado contra a fronteira do agregado.

## Critérios de Aceite
- [ ] Todos os testes em `report-rights-violation.use-case.spec.ts` passando.
