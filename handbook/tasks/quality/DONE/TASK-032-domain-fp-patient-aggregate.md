# TASK-032 - Migracao do Agregado Patient para Modelo Funcional

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `domain`, `refactor`, `fp`, `social-care`, `aggregate`
**Origem:** `handbook/quality/design-patterns-recommendations.md`

## Objetivo
Converter o Agregado `Patient` para o modelo funcional, removendo heranca de `AggregateRoot`, preservando regras de negocio, eventos de dominio e imutabilidade.

## Checklist de execucao
- [x] Migrar `Patient` para `type + const` (sem `class` e sem `extends AggregateRoot`).
- [x] Integrar com o padrão `Aggregate<State>` do kernel compartilhado.
- [x] Converter metodos para funcoes puras `data-last`.
- [x] Remover dependências diretas de infra (Clock/IdProvider) das funções de mutação.

## Criterios de Aceite
- [x] `rg -n "extends AggregateRoot" src/modules/social-care/domain` retorna zero resultados.
- [x] Gestão de eventos utiliza `Aggregate.addEvent` e `Aggregate.clearEvents`.
- [x] 100% dos testes de agregado passando.