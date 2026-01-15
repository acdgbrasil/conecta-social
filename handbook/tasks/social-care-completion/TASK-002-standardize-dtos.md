# [TASK-002] Padronizar DTOs de Entrada (Avaliação Social)

**Status:** [ ] Aberto
**Prioridade:** Média
**Labels:** `application`, `refactor`

## Descrição
Os Value Objects de avaliação social (`HousingCondition`, `SocioEconomicSituation`) são complexos e aninhados. Precisamos de DTOs claros na camada de aplicação para receber esses dados via API/JSON antes de convertê-los para o domínio.

## Tarefas
- Criar `application/dto/social-assessment.dto.ts`.
- Definir interfaces como `HousingConditionDTO`, `EconomicSituationDTO`.
- Criar funções factory/mappers que convertem DTO -> Result<VO, DomainError>.

## Critérios de Aceite
- [ ] DTOs definidos refletindo a estrutura dos VOs.
- [ ] Mappers implementados e testados unitariamente.
