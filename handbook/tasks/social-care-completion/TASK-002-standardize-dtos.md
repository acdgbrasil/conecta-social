# [TASK-002] Padronizar DTOs de Entrada (Avaliação Social)

**Status:** [x] Concluído
**Prioridade:** Média
**Labels:** `application`, `refactor`

## Descrição
Os Value Objects de avaliação social (`HousingCondition`, `SocioEconomicSituation`) são complexos e aninhados. Precisamos de DTOs claros na camada de aplicação para receber esses dados via API/JSON antes de convertê-los para o domínio.

## Tarefas
- [x] Criar `application/dto/social-assessment.dto.ts`.
- [x] Definir interfaces como `HousingConditionDTO`, `EconomicSituationDTO`.
- [x] Criar funções factory/mappers que convertem DTO -> Result<VO, DomainError>.

## Critérios de Aceite
- [x] DTOs definidos refletindo a estrutura dos VOs.
- [x] Mappers implementados e testados unitariamente.
