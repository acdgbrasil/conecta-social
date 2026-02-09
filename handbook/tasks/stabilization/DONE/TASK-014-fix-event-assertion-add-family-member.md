# [TASK-014] Ajustar Asserção de Eventos (AddFamilyMember)

**Status:** 🟢 Done
**Prioridade:** 🟡 Média
**Labels:** `test`, `fix`

## Descrição
O teste `deve adicionar membro, salvar e publicar evento` em `add-family-member.use-case.spec.ts` falha porque espera 1 evento mas recebe 2.

## Causa
Provavelmente o evento `PatientCreated` está sendo carregado junto com `FamilyMemberAdded` no `pullDomainEvents()`.

## Tarefas
- [x] Investigar a origem da duplicidade.
- [x] Ajustar o teste para verificar os nomes dos eventos ou limpar o bus antes da ação.

## Critérios de Aceite
- [x] Teste passando.

## Evidências
- `bun test src/modules/social-care/application/tests/unit/add-family-member.use-case.spec.ts` passando.
- Fluxo de limpeza/publicação de eventos estabilizado com `pullDomainEvents` + `UseCasePipeline`.
