# [TASK-004] UseCase: AssignPrimaryCaregiver

**Status:** [x] Concluído
**Prioridade:** Média
**Labels:** `feature`, `application`

## Descrição
Implementar o Caso de Uso para definir/trocar o cuidador principal do paciente. Esta é uma operação atômica que deve garantir que o anterior deixe de ser cuidador.

## Fluxo
1. Receber `patientId` e `targetMemberPersonId`.
2. Recuperar Agregado.
3. Chamar `patient.assignPrimaryCaregiver(id)`.
4. Persistir.

## Critérios de Aceite
- [x] Use Case implementado.
- [x] Teste: Flag `isPrimaryCaregiver` trocada corretamente entre membros.
- [x] Teste: Erro se o membro alvo não existe na família.
