# Inventário Inicial

## Scripts disponíveis (`package.json`)
- `dev`: `bun --hot src/index.ts`
- `start`: `bun src/index.ts`
- `test`: `bun test`

Scripts ausentes: não há `lint`, `typecheck` ou `build` configurados.

## Estrutura relevante
- `src/` – código principal (DDD híbrido atual)
- `api/` – coleções e artefatos de API (arquivos .json/.bru)
- `integration_tests/` – testes de integração (JS/TS)
- `bin/` – pasta reservada para entrypoints (vazia no momento)
- `doc/`, `systemDoc/`, `postgres_schema_v2/`, `mongodb_*` – artefatos de documentação e dados

## Execução de scripts atuais
- `bun run dev` → falha: `Failed to start server. Is port 3000 in use?`
- `bun run start` → falha: `Failed to start server. Is port 3000 in use?`
- `bun run test` → saída: "No tests found" (exit code 1)

Observação: erros em `dev`/`start` parecem ser relacionados à porta 3000 já ocupada no ambiente de execução.
