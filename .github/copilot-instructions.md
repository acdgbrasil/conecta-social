<!-- Project-specific Copilot instructions to help AI coding agents be immediately productive. Keep short and actionable. -->
# Conecta-Social — Copilot instructions

You are an AI coding assistant helping contributors to the Conecta-Social monorepo. Be concise, actionable and prefer changes that follow the repository conventions.

Key facts (read before editing)
- Workspace uses a TypeScript monorepo with Yarn/Workspaces-like structure defined in package.json -> `packages/*`.
- Preferred runtime/tools: Bun + TypeScript (many internal docs reference Bun). When editing scripts, prefer Bun-compatible commands unless package-specific files indicate otherwise.
- Architecture: Domain-Driven Design (DDD) + Hexagonal boundaries. Look for `domain`, `application`, `infra`, `presenter` folders inside packages and avoid crossing layers in imports.

Developer workflows
- Build / type check: repository references a top-level `tsconfig.json` which uses project references to `packages/*`. Use `tsc -b` (or Bun/tsc equivalent) in package roots when validating changes.
- CI: Jenkins is used (`Jenkinsfile` at repo root) and GitHub Actions exist under `.github/workflows/`. Respect branch rules present in workflows (dev/main/production). Do not modify deploy workflows lightly.
- Tests & linters: Look for package-level scripts. If missing, follow the repository patterns: prefer small, fast unit tests and run `eslint` and `tsc` as blocking checks in PRs.

Project-specific conventions & patterns
- Immutability is emphasized in project documentation (see `code_quality.AGENT.md`). Avoid in-place mutations for domain objects; prefer `readonly`, `ReadonlyArray<T>`, and immutable transforms.
- DDD/Hexagonal layering is enforced in review guidance: domain code must not import infra/presenter. Keep dependencies pointing inward (infra -> application -> domain).
- Naming and file layout: files and folders often use kebab-case. Keep exported types/interfaces explicit and strongly typed; `any` is discouraged.

Integration points & notable packages
- `packages/legacy` and `packages/your-service` are referenced by top-level TypeScript project references. Inspect these when making cross-package changes.
- `packages/shared/*` contains reusable primitives (e.g., `uuid-pattern/uuid.ts`). When changing shared utilities, update all dependent packages and include tests.

When making changes
- Small diffs only: prefer minimal, local changes. For behavior-altering edits in shared packages, add/adjust unit tests and update changelogs if present.
- Follow the Code Review Guardian rules (see `code_quality.AGENT.md`) for immutability, layering and TypeScript strictness—these are enforced by reviewers.
- For CI-affecting changes, run the pipeline locally where possible or validate `Jenkinsfile`/`.github/workflows/*` edits with maintainers first.

Examples & quick pointers
- UUID helper: `packages/shared/uuid-pattern/uuid.ts` uses explicit byte-level implementations and `formatUuid(bytes: Uint8Array)` for canonical formatting — prefer preserving low-level semantics when refactoring.
- Time-based APIs: many domain functions prefer injected clocks (avoid Date.now() direct usage). If you add time logic, prefer injection and testability.

What not to do
- Do not break DDD boundaries by importing `infra` into `domain` or adding global side effects (console.log, direct Date.now(), I/O) in domain code.
- Do not change CI deploy logic or branch protections without consulting the DevSecOps owner (see `dev_sec_ops.AGENT.md` for expectations).

If uncertain, ask
- Provide a short explanation of the intent, list affected files, and propose a small, reversible change. Maintain minimal surface area and include tests where applicable.

Feedback request
- After applying edits, ask maintainers if any repository-level scripts (build/test/ci) should be run locally and request help running them if you don't have the exact local environment.

References (in-repo)
- `code_quality.AGENT.md` — immutability, DDD and code-review rules
- `dev_sec_ops.AGENT.md` — CI/CD and security expectations
- `packages/shared/uuid-pattern/uuid.ts` — example low-level util to preserve when refactoring
