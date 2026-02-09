# TASK-029 - Fundamentos para Dominio Funcional (FP)

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `domain`, `refactor`, `fp`, `social-care`
**Origem:** `handbook/quality/design-patterns-recommendations.md`

## Objetivo
Preparar os fundamentos tecnicos para a migracao do dominio Social Care para o modelo funcional (Type + Const Namespace), garantindo type-safety sem construtores privados e habilitando composicao com `pipe`.

## Checklist de execucao
- [x] Adicionar tipos utilitarios em `src/shared/fn-pattern`:
- [x] `Branded<T, Brand extends string>`.
- [x] `DeepReadonly<T>`.
- [x] Exportar os novos tipos via `src/shared/fn-pattern/index.ts`.
- [x] Adicionar helper `curry` em `src/shared/fn-pattern/fundaments.ts`.

## Criterios de Aceite
- [x] `Branded` e `DeepReadonly` estao disponiveis em `@conecta/fn`.
- [x] Nenhuma alteracao de regra de negocio no dominio.