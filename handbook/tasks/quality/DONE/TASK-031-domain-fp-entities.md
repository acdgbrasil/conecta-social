# TASK-031 - Migracao de Entidades Filhas para Modelo Funcional

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `domain`, `refactor`, `fp`, `social-care`, `entities`
**Origem:** `handbook/quality/design-patterns-recommendations.md`

## Objetivo
Converter as entidades filhas do dominio Social Care para o modelo funcional (Type + Const Namespace), preservando regras de negocio, codigos de erro e imutabilidade.

## Checklist de execucao
- [x] Migrar `FamilyMember`, `Referral`, `SocialCareAppointment`, `RightsViolationReport` para `type + const`.
- [x] Remover `class`, `private constructor`, `copyWith` e `Object.freeze`.
- [x] Implementar funcoes de comportamento como funcoes puras.

## Criterios de Aceite
- [x] `rg -n "\bclass\b" src/modules/social-care/domain/entities` (exceto Agregado temporariamente) retorna zero resultados.
- [x] Todas as funcoes que alteram estado retornam um novo objeto.
- [x] 100% dos testes de entidades passando.