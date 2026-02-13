# 📋 Kanban — Conecta Social

Este documento é a fonte da verdade para o progresso do projeto.

## Notas de Consolidação (2026-02-08)
- IDs de tasks duplicados foram renumerados para manter unicidade global (`TASK-034` a `TASK-037`).
- Links internos foram corrigidos para a estrutura real em `handbook/tasks/**`.
- Status revisados com base no estado atual dos arquivos em `src/` e `handbook/tasks/**`.

## Notas de Análise (2026-02-09)
- `bun test` (suite completa) teve 1 falha: `src/shared/tests/performance/load.test.ts` com `EADDRINUSE` ao iniciar `Bun.serve({ port: 0 })`.
- `bunx --bun tsc --noEmit` reportou alto volume de erros de tipagem (baseline atual): `TS1362` (600 ocorrências) e `TS2307` (48 ocorrências).
- Foram detectados imports legados para `patient.repository.protocol` enquanto o arquivo atual é `patient.repository.port.ts` (ponto corrigido no ANL-001).
- O backlog abaixo inclui itens de estabilização para recuperar confiança de typecheck e previsibilidade da suíte.
- `ANL-002` concluído em 2026-02-09 com recuperação de baseline de TypeScript (`bunx --bun tsc --noEmit` => `EXIT:0`).

## Notas de Segurança (2026-02-13)
- Foi publicado o pacote de diagnóstico e execução de ROLES/PERMISSÕES:
  - `./reports/TASK-049-roles-permissions-assessment.md`
  - `./reports/TASK-049-rbac-target-model.md`
  - `./reports/TASK-049-implementation-plan.md`
  - `./reports/TASK-049-test-and-observability-plan.md`
- Prioridade operacional: implementar middleware real de auth/authz e proteger 100% das rotas de mutação de `social-care`.

## 🟢 To Do (Próximas Tarefas)

| Task | Título | Prioridade | Labels |
| :--- | :--- | :--- | :--- |
| [RBAC-001](./reports/TASK-049-implementation-plan.md) | Implementar AuthPort real + middleware authn/authz no runtime | 🔴 Crítica | `security`, `rbac`, `auth` |
| [RBAC-002](./reports/TASK-049-rbac-target-model.md) | Aplicar matriz Endpoint x Scope em todas as rotas Social Care | 🔴 Crítica | `security`, `rbac`, `social-care` |
| [RBAC-003](./reports/TASK-049-implementation-plan.md) | Governança de roles no People Context (promoção + validação persistência) | 🛡️ Alta | `people-context`, `rbac`, `governance` |
| [RBAC-004](./reports/TASK-049-test-and-observability-plan.md) | Cobertura de testes de autorização + observabilidade de 401/403 | 🛡️ Alta | `tests`, `security`, `observability` |
| [TASK-015](./tasks/quality/TASK-015-github-actions-ci-setup.md) | Configurar CI com GitHub Actions (testes de PR) | 11/02/2026 | quality |
| [TASK-016](./tasks/modules/TASK-016-api-layer-setup.md) | Setup da camada de API (Hono/Elysia) | 11/02/2026 | feature |
| [TASK-043](./tasks/stabilization/TODO/TASK-043-people-context-governance-and-events-consistency.md) | Alinhar governança e eventos do People Context | 🛡️ Alta | `security`, `docs`, `people-context` |
| [TASK-020](./tasks/modules/TASK-020-form-conversions-setup.md) | Setup do módulo Form Conversions | 🔵 Baixa | `feature`, `fmt` |
| [TASK-034](./tasks/modules/TASK-034-analysis-bi-setup.md) | Setup do módulo Analysis & Research | 🔵 Baixa | `feature`, `bi` |

## 🟡 In Progress (Em Andamento)

(Nenhuma task em andamento no momento)

## 📁 Backlog (Sugestões de Reviews & Melhorias)

| Task | Título | Origem | Labels |
| :--- | :--- | :--- | :--- |
| RBAC-005 | Revisar scopes M2M e remover uso amplo (`scope=all`) no Management Client | TASK-049 (roles/permissões) | `security`, `logto`, `m2m` |
| RBAC-006 | Introduzir guard automático que falha CI para rota sem policy de scope | TASK-049 (roles/permissões) | `quality`, `security`, `ci` |
| ANL-003 | Alinhar `BunSqlAdapter` ao contrato `SqlPort` (erro `TS2420`) | Análise local (Typecheck 2026-02-09) | `infra`, `sql`, `typing` |
| ANL-004 | Estabilizar `load.test.ts` e separar testes de performance da suíte padrão (`bun test`) | Análise local (Tests 2026-02-09) | `tests`, `perf`, `reliability` |

## ✅ Done (Histórico de Tarefas Concluídas)

| Task | Título | Concluído em | Trilha |
| :--- | :--- | :--- | :--- |
| [TASK-016](./tasks/modules/TASK-016-api-layer-setup.md) | Setup da camada de API (Hono/Elysia) | 11/02/2026 | feature |
| [TASK-048](./tasks/quality/TASK-048-quality-tests-and-docs-refinement.md) | Refinamento de Qualidade e Testes de Persistência | 11/02/2026 | quality |
| [TASK-010](./tasks/social-care-completion/DONE/TASK-010-usecase-report-rights-violation.md) | UseCase: ReportRightsViolation | 10/02/2026 | social-care-completion |
| [TASK-039](./tasks/stabilization/DONE/TASK-039-fix-vscode-workspace-portability.md) | Ajustar portabilidade dos arquivos do VSCode | 10/02/2026 | stabilization |
| [TASK-012](./tasks/stabilization/DONE/TASK-012-fix-postgres-auth.md) | Corrigir autenticação Postgres (Integração) | 09/02/2026 | stabilization |
| [TASK-013](./tasks/stabilization/DONE/TASK-013-implement-report-rights-violation.md) | Implementar `ReportRightsViolationUseCase` | 09/02/2026 | stabilization |
| [TASK-014](./tasks/stabilization/DONE/TASK-014-fix-event-assertion-add-family-member.md) | Ajustar asserção de eventos (AddFamilyMember) | 09/02/2026 | stabilization |
| [TASK-036](./tasks/stabilization/DONE/TASK-036-fix-handbook-paths.md) | Corrigir caminhos desatualizados no handbook | 09/02/2026 | stabilization |
| ANL-002 | Recuperar baseline de TypeScript (`TS1362`/`TS2307`) e reativar typecheck no fluxo de CI | 09/02/2026 | analysis |
| [TASK-038](./tasks/stabilization/TASK-038-fix-public-api-barrel-export-order.md) | Corrigir ordem dos exports da API pública | 08/02/2026 | stabilization |
| [TASK-041](./tasks/stabilization/TASK-041-command-adapter-uuid-validation-compatibility.md) | Hardening UUID v7 nos Command Adapters | 08/02/2026 | stabilization |
| [TASK-042](./tasks/stabilization/TASK-042-fix-deepreadonly-function-signature.md) | Corrigir `DeepReadonly` para funções com argumentos | 08/02/2026 | stabilization |
| [TASK-040](./tasks/stabilization/TASK-040-fix-timestamp-toisostring-recursion.md) | Corrigir recursão em `Timestamp.toISOString` | 08/02/2026 | stabilization |
| [TASK-033](./tasks/quality/TASK-033-domain-code-smell-cleanup.md) | Limpeza de code smells do domínio | 08/02/2026 | quality |
| [TASK-024](./tasks/quality/TASK-024-social-care-domain-review.md) | Review de Qualidade — Social Care | 08/02/2026 | quality |
| [TASK-001](./tasks/social-care-completion/TASK-001-expand-repository.md) | Expandir repositório com `findById` | 05/02/2026 | social-care-completion |
| [TASK-002](./tasks/social-care-completion/TASK-002-standardize-dtos.md) | Padronizar DTOs de entrada | 03/02/2026 | social-care-completion |
| [TASK-003](./tasks/social-care-completion/TASK-003-usecase-add-family-member.md) | UseCase: AddFamilyMember | 03/02/2026 | social-care-completion |
| [TASK-004](./tasks/social-care-completion/TASK-004-usecase-assign-primary-caregiver.md) | UseCase: AssignPrimaryCaregiver | 03/02/2026 | social-care-completion |
| [TASK-005](./tasks/social-care-completion/TASK-005-usecase-remove-family-member.md) | UseCase: RemoveFamilyMember | 03/02/2026 | social-care-completion |
| [TASK-006](./tasks/social-care-completion/TASK-006-usecase-update-housing.md) | UseCase: UpdateHousingCondition | 03/02/2026 | social-care-completion |
| [TASK-007](./tasks/social-care-completion/TASK-007-usecase-update-socioeconomic.md) | UseCase: UpdateSocioEconomicSituation | 03/02/2026 | social-care-completion |
| [TASK-008](./tasks/social-care-completion/TASK-008-usecase-register-appointment.md) | UseCase: RegisterAppointment | 03/02/2026 | social-care-appointment |
| [TASK-009](./tasks/social-care-completion/TASK-009-usecase-create-referral.md) | UseCase: CreateReferral | 03/02/2026 | social-care-completion |
| [TASK-011](./tasks/social-care-completion/TASK-011-refactor-social-health-summary.md) | Refatorar SocialHealthSummary | 03/02/2026 | social-care-completion |
| [TASK-017](./tasks/backlog/TASK-017-aggregate-event-cleanup.md) | Limpeza de eventos no agregado | 06/02/2026 | backlog |
| [TASK-018](./tasks/backlog/TASK-018-outbox-pattern-implementation.md) | Outbox pattern para eventos | 06/02/2026 | backlog |
| [TASK-019](./tasks/backlog/TASK-019-command-pattern-migration.md) | Migração para Command Pattern | 06/02/2026 | backlog |
| [TASK-021](./tasks/quality/TASK-021-remove-any-from-tests.md) | Remover `any` dos testes unitários | 05/02/2026 | quality |
| [TASK-022](./tasks/quality/TASK-022-benchmarks-imutable-list.md) | Benchmarks de ImutableList no CI | 07/02/2026 | quality |
| [TASK-023](./tasks/quality/TASK-023-modernize-typescript-libs.md) | Modernizar libs funcionais (Result/Option/Fn) | 07/02/2026 | quality |
| [TASK-025](./tasks/backlog/TASK-025-decouple-interface-dtos-from-domain-enums.md) | Desacoplar DTOs da interface dos enums do domínio | 06/02/2026 | backlog |
| [TASK-026](./tasks/backlog/TASK-026-extract-persistence-mappers.md) | Extrair mappers de persistência | 06/02/2026 | backlog |
| [TASK-027](./tasks/backlog/TASK-027-handle-persistence-mapping-errors.md) | Tratar erros de mapping na persistência | 06/02/2026 | backlog |
| [TASK-028](./tasks/backlog/TASK-028-response-mapper-layer.md) | Criar Response Mapper (adapter outbound) | 06/02/2026 | backlog |
| [TASK-029](./tasks/quality/TASK-029-domain-fp-foundations.md) | Fundamentos para domínio funcional (FP) | 07/02/2026 | quality |
| [TASK-030](./tasks/quality/TASK-030-domain-fp-value-objects.md) | Migração de Value Objects para FP | 07/02/2026 | quality |
| [TASK-031](./tasks/quality/TASK-031-domain-fp-entities.md) | Migração de entidades filhas para FP | 07/02/2026 | quality |
| [TASK-032](./tasks/quality/TASK-032-domain-fp-patient-aggregate.md) | Migração do agregado Patient para FP | 07/02/2026 | quality |
| [TASK-037](./tasks/stabilization/TASK-037-refine-gitignore.md) | Refinar `.gitignore` (ignorados indevidos) | 06/02/2026 | stabilization |
