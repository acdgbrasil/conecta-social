# 📋 Kanban — Conecta Social

Este documento é a fonte da verdade para o progresso do projeto.

## Notas de Consolidação (2026-02-08)
- IDs de tasks duplicados foram renumerados para manter unicidade global (`TASK-034` a `TASK-037`).
- Links internos foram corrigidos para a estrutura real em `handbook/tasks/**`.
- Status revisados com base no estado atual dos arquivos em `src/` e `handbook/tasks/**`.

## 🟢 To Do (Próximas Tarefas)

| Task | Título | Prioridade | Labels |
| :--- | :--- | :--- | :--- |
| [TASK-010](./tasks/social-care-completion/TASK-010-usecase-report-rights-violation.md) | UseCase: ReportRightsViolation | 🔥 Alta | `feature`, `application` |
| [TASK-012](./tasks/stabilization/TASK-012-fix-postgres-auth.md) | Corrigir autenticação Postgres (Integração) | 🔥 Alta | `infra`, `fix` |
| [TASK-013](./tasks/stabilization/TASK-013-implement-report-rights-violation.md) | Implementar `ReportRightsViolationUseCase` | 🔥 Alta | `feature`, `application` |
| [TASK-014](./tasks/stabilization/TASK-014-fix-event-assertion-add-family-member.md) | Ajustar asserção de eventos (AddFamilyMember) | 🟡 Média | `test`, `fix` |
| [TASK-015](./tasks/quality/TASK-015-github-actions-ci-setup.md) | Configurar CI com GitHub Actions (testes de PR) | 🟡 Média | `ci`, `infra` |
| [TASK-016](./tasks/modules/TASK-016-api-layer-setup.md) | Setup da camada de API (Hono/Elysia) | 🔥 Alta | `feature`, `interface` |
| [TASK-041](./tasks/stabilization/TASK-041-command-adapter-uuid-validation-compatibility.md) | Revisar validação UUID nos command adapters | 🔥 Alta | `validation`, `adapter`, `compatibility` |
| [TASK-043](./tasks/stabilization/TASK-043-people-context-governance-and-events-consistency.md) | Alinhar governança e eventos do People Context | 🛡️ Alta | `security`, `docs`, `people-context` |
| [TASK-020](./tasks/modules/TASK-020-form-conversions-setup.md) | Setup do módulo Form Conversions | 🔵 Baixa | `feature`, `fmt` |
| [TASK-034](./tasks/modules/TASK-034-analysis-bi-setup.md) | Setup do módulo Analysis & Research | 🔵 Baixa | `feature`, `bi` |
| [TASK-035](./tasks/stabilization/TASK-035-fix-docker-injection-vulnerability.md) | Corrigir vulnerabilidade no `docker-compose` | 🛡️ Alta | `security`, `infra` |
| [TASK-036](./tasks/stabilization/TASK-036-fix-handbook-paths.md) | Corrigir caminhos desatualizados no handbook | 🔵 Baixa | `docs`, `fix` |
| [TASK-039](./tasks/stabilization/TASK-039-fix-vscode-workspace-portability.md) | Ajustar portabilidade dos arquivos do VSCode | 🟡 Média | `dx`, `tooling`, `vscode` |

## 🟡 In Progress (Em Andamento)

(Nenhuma task em andamento no momento)

## 📁 Backlog (Sugestões de Reviews & Melhorias)

| Task | Título | Origem | Labels |
| :--- | :--- | :--- | :--- |
| - | (Nenhuma task em backlog aberta no momento) | - | - |

## ✅ Done (Histórico de Tarefas Concluídas)

| Task | Título | Concluído em | Trilha |
| :--- | :--- | :--- | :--- |
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