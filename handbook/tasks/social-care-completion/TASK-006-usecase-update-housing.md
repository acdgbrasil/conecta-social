# [TASK-006] UseCase: UpdateHousingCondition

**Status:** [ ] Aberto
**Prioridade:** Média
**Labels:** `feature`, `application`

## Descrição
Permitir a atualização completa das condições de moradia do paciente.

## Detalhes
- Deve receber um DTO completo (`HousingConditionDTO`).
- A operação é de **substituição** (o VO anterior é descartado, o novo assume).
- Deve validar regras de domínio (ex: banheiros <= quartos) durante a criação do VO.

## Critérios de Aceite
- [ ] Use Case implementado.
- [ ] Teste de integração com repositório (garantir que o update persistiu).
