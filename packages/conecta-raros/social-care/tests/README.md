# Estrutura de testes — Social Care

Esta pasta concentra a suíte de testes do contexto `social-care`, separada por tipo para funcionar como documentação viva do domínio.

- `unit/value-objects/` — regras isoladas dos VOs (`Diagnosis`, `HousingCondition`, etc.).
- `unit/entities/` — comportamento das entidades e agregados (`Patient`, `FamilyMember`, `Referral`, ...).
- `unit/errors/` — atalhos e catálogos de erros de domínio (`ICDError`, `PatientErrors`, `SocialBenefitErrors`).
- `regression/` — cenários RED derivados de code reviews ou bugs conhecidos; servem como guardiões até que a correção seja entregue.
- `support/` *(futuro)* — espaço reservado para builders/shared fixtures quando necessário.

### Convenções
- Importar sempre via `@conecta/social-care` (ajudado pelos `paths` do `tsconfig`).
- Nomear arquivos com foco no comportamento (`patient.aggregate.spec.ts`, `social-health-summary.red.spec.ts`).
- Quando um teste representar bug pendente, prefira `test.todo` ou mover para `regression/` com contexto claro.

### Execução
- Rodar o contexto completo: `bun test packages/conecta-raros/social-care/tests`.
- Apenas VOs: `bun test --filter value-objects`.
- Apenas regressões: `bun test packages/conecta-raros/social-care/tests/regression`.

As opções `--filter` e filtros por path vêm da CLI do Bun (`handbook/tooling/bun/Packege_Manager/documentation.md`) e permitem idempotência no monorepo sem depender de ferramentas externas.
