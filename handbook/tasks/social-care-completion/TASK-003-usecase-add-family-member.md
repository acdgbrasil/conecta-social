# [TASK-003] UseCase: AddFamilyMember

**Status:** [x] Concluído
**Prioridade:** Alta
**Labels:** `feature`, `application`

## Descrição
Implementar o Caso de Uso que permite adicionar um membro à família de um paciente existente.

## Fluxo
1. Receber `RegisterFamilyMemberInput` (`patientId`, `memberPersonId`, `relationship`, etc.).
2. Recuperar o Agregado `Patient` via repositório.
3. Chamar `patient.addFamilyMember(member)`.
4. Persistir o agregado atualizado.
5. Publicar eventos (`FamilyMemberAdded`).

## Critérios de Aceite
- [x] Use Case implementado.
- [x] Teste: Sucesso (membro adicionado).
- [x] Teste: Erro (membro duplicado `PAT-005`).
- [x] Teste: Erro (paciente não encontrado).
