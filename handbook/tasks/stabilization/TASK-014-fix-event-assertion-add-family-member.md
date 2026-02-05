# [TASK-014] Ajustar Asserção de Eventos (AddFamilyMember)

**Status:** 🔴 To Do
**Prioridade:** 🟡 Média
**Labels:** `test`, `fix`

## Descrição
O teste `deve adicionar membro, salvar e publicar evento` em `add-family-member.use-case.spec.ts` falha porque espera 1 evento mas recebe 2.

## Causa
Provavelmente o evento `PatientCreated` está sendo carregado junto com `FamilyMemberAdded` no `pullDomainEvents()`.

## Tarefas
- [ ] Investigar a origem da duplicidade.
- [ ] Ajustar o teste para verificar os nomes dos eventos ou limpar o bus antes da ação.

## Critérios de Aceite
- [ ] Teste passando.
