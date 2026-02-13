# TASK-050 - Lint Baseline e Mapeamento Completo

**Data:** 2026-02-13  
**Escopo:** repositório completo (`biome check .`)  
**Objetivo:** criar baseline fechado de lint para correção incremental com rastreabilidade.

## Comando Executado

```bash
bunx biome check . --max-diagnostics=5000
```

## Resultado Geral

- Total de diagnósticos mapeados: **486**
- Sumário do Biome:
- **268 errors**
- **215 warnings**
- **3 infos**

## Distribuição por Regra (completa)

1. `format`: 186
2. `lint/suspicious/noExplicitAny`: 152
3. `assist/source/organizeImports`: 78
4. `lint/complexity/noImportantStyles`: 25
5. `lint/correctness/noUnusedImports`: 13
6. `lint/style/useImportType`: 12
7. `lint/correctness/useYield`: 4
8. `lint/correctness/noUnusedVariables`: 3
9. `lint/complexity/useArrowFunction`: 3
10. `lint/suspicious/noUselessEscapeInString`: 2
11. `lint/correctness/useParseIntRadix`: 2
12. `lint/correctness/noUnusedFunctionParameters`: 2
13. `lint/suspicious/noTsIgnore`: 1
14. `lint/suspicious/noGlobalIsNan`: 1
15. `lint/performance/noAccumulatingSpread`: 1
16. `lint/complexity/noUselessCatch`: 1

## Distribuição por Área

- `src/**`: 447 diagnósticos
- `handbook/**`: 35 diagnósticos
- `.vscode/**`: 2 diagnósticos
- raiz do projeto: 2 diagnósticos

## Distribuição por Tipo de Código

- `src` produção (`.ts` sem spec/test): 236
- `src` testes (`*.spec.ts`/`*.test.ts`): 211
- não-`src` (docs/config): 39

## Top Arquivos com Maior Volume

1. `src/modules/social-care/interface/adapter/http/social-care.http.adapter.spec.ts`: 41
2. `handbook/tooling/bun/bun_docs/style.css`: 26
3. `src/shared/tests/unit/fn-pattern/use-case-pipeline.spec.ts`: 13
4. `src/infrastructure/runtime/bun/sql.adapter.ts`: 13
5. `src/modules/social-care/domain/entities/patient/types.ts`: 12
6. `src/modules/social-care/interface/adapter/http/controllers/tests/controllers.coverage.spec.ts`: 11
7. `src/modules/social-care/interface/adapter/persistence/tests/unit/patient.mapper.spec.ts`: 10
8. `src/infrastructure/runtime/bun/tests/unit/sql.adapter.spec.ts`: 8

## Principais Combinações Arquivo + Regra

1. `src/modules/social-care/interface/adapter/http/social-care.http.adapter.spec.ts` + `lint/suspicious/noExplicitAny`: 40
2. `handbook/tooling/bun/bun_docs/style.css` + `lint/complexity/noImportantStyles`: 25
3. `src/modules/social-care/interface/adapter/http/controllers/tests/controllers.coverage.spec.ts` + `lint/suspicious/noExplicitAny`: 10
4. `src/infrastructure/runtime/bun/sql.adapter.ts` + `lint/suspicious/noExplicitAny`: 10
5. `src/shared/tests/unit/fn-pattern/use-case-pipeline.spec.ts` + `lint/suspicious/noExplicitAny`: 8
6. `src/modules/social-care/interface/adapter/persistence/tests/unit/patient.mapper.spec.ts` + `lint/suspicious/noExplicitAny`: 8
7. `src/modules/social-care/domain/entities/patient/types.ts` + `lint/style/useImportType`: 8
8. `src/infrastructure/runtime/bun/tests/unit/sql.adapter.spec.ts` + `lint/suspicious/noExplicitAny`: 7

## Leitura Técnica do Baseline

- O maior bloco é mecânico: `format` + `organizeImports` = **264** ocorrências.
- O segundo maior bloco é tipagem fraca: `noExplicitAny` = **152** ocorrências.
- Em `src/tests`, o maior ruído é `noExplicitAny` (**121**), então vale tratar primeiro por padrões de mock/test-doubles.
- Em `src/prod`, há combinação de `format`, `organizeImports`, `noExplicitAny`, `useImportType` e `noUnusedImports`.
- Em `handbook/tooling/bun/bun_docs/**`, os alertas são majoritariamente estéticos (`noImportantStyles`, `useArrowFunction`, escape em string).

## Plano de Correção Recomendado

1. Fase 1 (rápida, baixo risco): aplicar `format` e `organizeImports` globalmente.
2. Fase 2 (testes): remover `any` em `*.spec.ts` e `*.test.ts` com utilitários tipados de mocks.
3. Fase 3 (produção): remover `any` em adapters/ports/use-cases e aplicar `useImportType`.
4. Fase 4 (docs/tooling): ajustar `handbook/tooling/bun/bun_docs/**` ou excluir do escopo de lint se não fizer parte do gate de CI.
5. Fase 5 (enforcement): reexecutar lint, travar regressão com gate incremental por pasta.

## Artefatos Versionados Deste Relatório

- Diagnósticos completos (486 entradas): `handbook/reports/lint/TASK-050-lint-diagnostics-headers.txt`
- Agregado por regra: `handbook/reports/lint/TASK-050-lint-by-rule.tsv`
- Agregado por arquivo: `handbook/reports/lint/TASK-050-lint-by-file.tsv`
- Agregado por arquivo+regra: `handbook/reports/lint/TASK-050-lint-by-file-rule.tsv`

## Status

- Baseline de lint consolidado e versionado.
- Próximo passo sugerido: executar Fase 1 e publicar novo baseline (`TASK-050-lint-baseline-map-v2.md`) para medir delta.
