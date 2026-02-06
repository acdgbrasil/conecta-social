# 📋 Kanban — Conecta Social

Este documento é a fonte da verdade para o progresso do projeto.

## 🟢 To Do (Próximas Tarefas)

| Task | Título | Prioridade | Labels |
| :--- | :--- | :--- | :--- |
| [TASK-012](./stabilization/TASK-012-fix-postgres-auth.md) | Corrigir Autenticação Postgres (Integração) | 🔥 Alta | `infra`, `fix` |
| [TASK-013](./stabilization/TASK-013-implement-report-rights-violation.md) | Implementar ReportRightsViolationUseCase | 🔥 Alta | `feature`, `app` |
| [TASK-023](./stabilization/TASK-023-fix-docker-injection-vulnerability.md) | Corrigir Vulnerabilidade no docker-compose | 🛡️ Alta | `security`, `fix` |
| [TASK-014](./stabilization/TASK-014-fix-event-assertion-add-family-member.md) | Ajustar Asserção de Eventos (AddFamilyMember) | 🟡 Média | `test`, `fix` |
| [TASK-025](./stabilization/TASK-025-fix-handbook-paths.md) | Corrigir caminhos no Handbook | 🔵 Baixa | `docs`, `fix` |
| [TASK-015](./quality/TASK-015-github-actions-ci-setup.md) | Configurar CI com GitHub Actions | 🟡 Média | `ci`, `infra` |
| [TASK-024](./quality/TASK-024-social-care-domain-review.md) | Endereçar achados do review Social Care | 🔥 Alta | `quality`, `domain` |
| [TASK-016](./modules/TASK-016-api-layer-setup.md) | Setup da Camada de API (Hono/Elysia) | 🔥 Alta | `feature`, `interface` |
| [TASK-019](./modules/TASK-019-analysis-bi-setup.md) | Setup do Módulo Analysis & Research | 🔵 Baixa | `feature`, `bi` |
| [TASK-020](./modules/TASK-020-form-conversions-setup.md) | Setup do Módulo Form Conversions | 🔵 Baixa | `feature`, `fmt` |

## 🟡 In Progress (Em Andamento)

| Task | Título | Responsável | Início |
| :--- | :--- | :--- | :--- |
| - | (Nenhuma tarefa em execução no momento) | - | - |

## 📁 Backlog (Sugestões de Reviews & Melhorias)

| Task | Título | Origem | Labels |
| :--- | :--- | :--- | :--- |
| - | (Nenhuma tarefa em backlog no momento) | - | - |

## ✅ Done (Histórico de Tarefas Concluídas)

| Task | Título | Concluído em | Versão |
| :--- | :--- | :--- | :--- |
| [TASK-001](../tasks/social-care-completion/TASK-001-expand-repository.md) | Expandir Repositório com findById | 05/02/2026 | v0.2.0 |
| [TASK-002](../tasks/social-care-completion/TASK-002-standardize-dtos.md) | Padronizar DTOs de Entrada | 03/02/2026 | v0.1.0 |
| [TASK-003](../tasks/social-care-completion/TASK-003-usecase-add-family-member.md) | UseCase: AddFamilyMember | 03/02/2026 | v0.1.0 |
| [TASK-004](../tasks/social-care-completion/TASK-004-usecase-assign-primary-caregiver.md) | UseCase: AssignPrimaryCaregiver | 03/02/2026 | v0.1.0 |
| [TASK-005](../tasks/social-care-completion/TASK-005-usecase-remove-family-member.md) | UseCase: RemoveFamilyMember | 03/02/2026 | v0.1.0 |
| [TASK-006](../tasks/social-care-completion/TASK-006-usecase-update-housing.md) | UseCase: UpdateHousingCondition | 03/02/2026 | v0.1.0 |
| [TASK-007](../tasks/social-care-completion/TASK-007-usecase-update-socioeconomic.md) | UseCase: UpdateSocioEconomicSituation | 03/02/2026 | v0.1.0 |
| [TASK-008](../tasks/social-care-completion/TASK-008-usecase-register-appointment.md) | UseCase: RegisterAppointment | 03/02/2026 | v0.1.0 |
| [TASK-009](../tasks/social-care-completion/TASK-009-usecase-create-referral.md) | UseCase: CreateReferral | 03/02/2026 | v0.1.0 |
| [TASK-011](../tasks/social-care-completion/TASK-011-refactor-social-health-summary.md) | Refatorar SocialHealthSummary | 03/02/2026 | v0.1.0 |
| [TASK-021](./quality/TASK-021-remove-any-from-tests.md) | Remover `any` dos Testes Unitários | 05/02/2026 | v0.2.0 |
| [TASK-022](./quality/TASK-022-benchmarks-imutable-list.md) | Integrar Benchmarks de ImutableList no CI | 05/02/2026 | v0.2.0 |
| [TASK-023](./quality/TASK-023-modernize-typescript-libs.md) | Modernizar libs funcionais (Result/Option/Fn) | 06/02/2026 | v0.2.0 |
| [TASK-026](./stabilization/TASK-026-refine-gitignore.md) | Refinar .gitignore (Ignorados indevidos) | 06/02/2026 | - |
| [TASK-017](./backlog/TASK-017-aggregate-event-cleanup.md) | Implementar Limpeza de Eventos no Agregado | 06/02/2026 | - |
| [TASK-018](./backlog/TASK-018-outbox-pattern-implementation.md) | Implementar Outbox Pattern para Eventos | 06/02/2026 | - |
| [TASK-019](./backlog/TASK-019-command-pattern-migration.md) | Migrar Use Cases para Command Pattern | 06/02/2026 | - |
| [TASK-025](./backlog/TASK-025-decouple-interface-dtos-from-domain-enums.md) | Desacoplar DTOs da Interface dos Enums de Domínio | 06/02/2026 | - |
| [TASK-026](./backlog/TASK-026-extract-persistence-mappers.md) | Extrair Mappers de Persistência do Repositório | 06/02/2026 | - |
| [TASK-027](./backlog/TASK-027-handle-persistence-mapping-errors.md) | Tratar Erros de Mapping na Persistência | 06/02/2026 | - |
| [TASK-028](./backlog/TASK-028-response-mapper-layer.md) | Criar Response Mapper (Adapter Outbound) | 06/02/2026 | - |
| - | **Migração para Monolito Modular** | 05/02/2026 | v0.2.0 |
| - | **Isolamento de Runtime (Ports & Adapters)** | 05/02/2026 | v0.2.0 |
