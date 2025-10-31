# Migration Notes

## Estrutura atual
- `src/index.ts` reexporta os módulos disponibilizados em `packages/shared` e `packages/social/social-care`.
- `packages/shared/` reúne os padrões reutilizáveis (`Result`, `Option`, `DomainError`, `Uuid`, utilitários funcionais).
- `packages/social/social-care/` contém os Value Objects e catálogos de erro do domínio Social Care, organizados por `value-objects/` e `err/`.
- Diretórios e artefatos anteriores ao corte 1.5 (`packages/legacy`, `integration_tests`, `postgres_schema_v2`, etc.) foram removidos.

## Tooling e aliases
- `tsconfig.json` define os aliases `@conecta/*` apontando diretamente para os pacotes internos, eliminando a necessidade de `node_modules`.
- `bunfig.toml` e o re-export de `packages/shared/index.ts` garantem que os imports internos funcionem tanto em tempo de compilação quanto de execução.
- Tipagens mínimas do runner vivem em `types/bun-test.d.ts`, permitindo `bun test` sem depender de `bun-types`.

## Como evoluir
- Ao adicionar um novo pacote compartilhado, exponha-o via `packages/shared/index.ts` e atualize os aliases caso necessário.
- Para domínio, centralize exports em `packages/social/social-care/index.ts` para manter `src/index.ts` estável.
- Dependências externas devem ser importadas via URLs/git compatíveis com Bun.

Documentos adicionais do processo permanecem em `refactor-report/`.
