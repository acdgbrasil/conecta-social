# [TASK-013] Implementar ReportRightsViolationUseCase

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `feature`, `application`
**Origem:** Task original + revisão PR #148 (Kody AI)

## Descrição
A implementação atual do UseCase `ReportRightsViolation` lança um erro `Not implemented`.

## Comentários Relacionados (PR #148)
- `src/modules/social-care/application/use-cases/report-rights-violation.use-case.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226045
  - Risco apontado: método `execute` quebra contrato ao lançar exceção em vez de retornar `Result<boolean, DomainError>`.

## Tarefas
- [ ] Remover o `throw new Error("Not implemented")` e cumprir o contrato de retorno `Result<boolean, DomainError>`.
- [ ] Implementar o método `execute`.
- [ ] Fluxo: Recuperar `Patient`, chamar `reportRightsViolation` no agregado, salvar e emitir eventos.
- [ ] Garantir que o `victimId` seja validado contra a fronteira do agregado.

## Critérios de Aceite
- [ ] Todos os testes em `report-rights-violation.use-case.spec.ts` passando.
