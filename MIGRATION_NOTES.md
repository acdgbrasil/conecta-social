# Migration Notes

## Estrutura (antes)
- `src/`
- `api/`
- `integration_tests/`
- `bin/`
- `doc/`
- `postgres_schema_v2/`
- Arquivos de schema `mongodb_*.json` e `service_manifest.json`

## Estrutura (depois)
- `packages/legacy/` contém todo o código original e artefatos acima
- `packages/your-service/` representa novos serviços seguindo o guia DDD/hex
- `src/` mantém apenas shims de compatibilidade (sem serviços diretos)
- `bin/` guarda scripts utilitários e entrypoints dos serviços

## Shims criados
- `src/index.ts` → reexporta `../packages/legacy/src/index.ts`

## Alias e tooling
- `@legacy/*` segue resolvido em `packages/legacy/src/*` (`packages/legacy/tsconfig.json`)
- ESLint ignora `packages/legacy/**` para evitar ruído do legado (`eslint.config.mjs` e `.eslintignore`)
- Scripts de build/teste do legado vivem em `packages/legacy/package.json`

## Como executar
- **Legado**: usar `bin/legacy.sh` ou executar scripts (`bun run dev`, `bun run start`) dentro de `packages/legacy/`.
- **Novos serviços**: cada pacote em `packages/*` possui seus próprios scripts (`bun run validate`, etc.).

Documentos adicionais do processo estão em `refactor-report/`.
