# Estrutura de testes — Pacotes compartilhados

- `unit/<package>/` — cobre comportamentos de cada utilitário (`fn-pattern`, `result-pattern`, etc.).
- `regression/` — cenários RED que capturam bugs históricos ou regressões do kernel compartilhado.

### Execução rápida
- Todos os utilitários: `bun test src/shared/tests/unit`.
- Selecionar um pacote: `bun test --filter "fn-pattern"`.
- Regressões: `bun test src/shared/tests/regression`.

Os filtros seguem o fluxo descrito na documentação do Bun sobre workspaces (`handbook/tooling/bun/Packege_Manager/documentation.md`), permitindo rodadas enxutas dentro do monorepo.
