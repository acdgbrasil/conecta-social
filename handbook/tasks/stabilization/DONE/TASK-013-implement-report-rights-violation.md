# [TASK-013] Implementar ReportRightsViolationUseCase

**Status:** 🟢 Done
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
- [x] Remover o `throw new Error("Not implemented")` e cumprir o contrato de retorno `Result<boolean, DomainError>`.
- [x] Implementar o método `execute`.
- [x] Fluxo: Recuperar `Patient`, chamar `reportRightsViolation` no agregado, salvar e emitir eventos.
- [x] Garantir que o `victimId` seja validado contra a fronteira do agregado.

## Critérios de Aceite
- [x] Todos os testes em `report-rights-violation.use-case.spec.ts` passando.

## Evidências
- `bun test src/modules/social-care/application/tests/unit/report-rights-violation.use-case.spec.ts` com testes passando.
- Fluxo implementado em `src/modules/social-care/application/use-cases/report-rights-violation.use-case.ts`.
