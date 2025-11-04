<!-- Project-specific Copilot instructions. Keep short, opinionated and actionable. -->
# Conecta Social — Copilot Guardrails

You are assisting in a Bun-first TypeScript monorepo that follows DDD + EDD with tests as documentation. All knowledge lives under `handbook/`. Enforce these rules on every change and PR review.

## Golden rules (read first)
- Runtime/tooling: **only Bun**. Never introduce `node_modules`; use `bun install --frozen-lockfile` and scripts compatible com Bun.
- Imports: prefer the provided aliases (`@conecta/social-care`, `@conecta/result`, etc. – see `tsconfig.json` and handbook). Avoid relative `../` outside the package boundary.
- Versioning: bump per PR following `MAJOR.MINOR.FEATURE.PATCH` (`handbook/process/versioning.md`). If you change behavior, ensure the version update and changelog entry exist.
- Documentation: any decision that touches domínio, processos ou retrocompatibilidade deve atualizar o `handbook/` (principalmente `handbook/principles`, `handbook/process`, `handbook/reports`).

## Domain & design constraints
- Respeite DDD: agregados e VOs vivem em `packages/social/social-care`. Nunca vazem regras para infra. Use invariantes descritas em `handbook/principles/patient-aggregate.md` e `handbook/principles/context-map.md`.
- Eventos e retrocompatibilidade devem ser registrados em `handbook/process/retrocompatibilidade.md` antes de remover comportamentos antigos.
- Imutabilidade obrigatória nos VOs/entidades (ver `code_quality.AGENT.md`). Prefira `copyWith`, `Result.ok/err` e listas imutáveis (`ImutableListFactory`).

## Testes como documentação viva
- Estrutura de testes: `packages/<context>/tests/{unit,regression}` (`handbook/principles/testing-and-domain.md`). Use `*.spec.ts` e, para bugs, mova cenários para `tests/regression`.
- Rodar sempre os focos relevantes com Bun (ex.: `bun test packages/social/social-care/tests/unit/entities`). Exija que cada bug fix tenha teste RED → GREEN.
- Não aceite PR sem testes novos/ajustados quando lógica muda, nem sem atualização do handbook que descreve o comportamento.

## Revisão de PR
- Bloqueie diffs que reintroduzam imports relativos quebrando context boundaries, ou que criem dependências externas que gerem `node_modules`.
- Verifique se versões foram incrementadas, README/tests/handbook atualizados e que scripts Bun são usados (nunca `npm`/`yarn`).
- Rejeite alterações sem cobertura de testes, sem referências ao handbook ou que ignorem matrizes de retrocompatibilidade.

## Referências rápidas
- `handbook/README.md` — mapa da documentação.
- `handbook/process/versioning.md` — regra de version bump.
- `handbook/principles/testing-and-domain.md` — convenções de TDD/BDD.
- `handbook/principles/patient-aggregate.md` — contrato do agregado principal.
- `packages/shared/tests/README.md` e `packages/social/social-care/tests/README.md` — estrutura de suites.
