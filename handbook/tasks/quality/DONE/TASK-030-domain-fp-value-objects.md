# TASK-030 - Migracao de Value Objects para Modelo Funcional

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `domain`, `refactor`, `fp`, `social-care`, `value-objects`
**Origem:** `handbook/quality/design-patterns-recommendations.md`

## Objetivo
Converter todos os Value Objects do dominio Social Care de classes para `type + const Namespace`, eliminando `copyWith` e padronizando criacao/validacao com funcoes puras.

## Checklist de execucao
- [x] Migrar todos os VOs (Diagnosis, PersonId, Timestamp, etc.) para `type + const`.
- [x] Remover `class`, `private constructor`, `copyWith` e uso de `new`.
- [x] Atualizar todos os imports e testes para a nova API funcional.

## Criterios de Aceite
- [x] `rg -n "\bclass\b" src/modules/social-care/domain/value-objects` retorna zero resultados.
- [x] Cada VO exporta simultaneamente `type` e `const` com o mesmo nome.
- [x] Todas as factories retornam `Result`.
- [x] 100% dos testes de VOs passando no novo paradigma.