# 📋 Kanban — Conecta Social

Este documento é a fonte da verdade para o progresso do projeto.

## 🟢 To Do (Próximas Tarefas)

| Task | Título | Prioridade | Labels |
| :--- | :--- | :--- | :--- |
| [TASK-033](../tasks/quality/TASK-033-domain-code-smell-cleanup.md) | Refinamento Estrutural do Domínio | 🟡 Média | `refactor`, `domain` |
| [TASK-012](../tasks/stabilization/TASK-012-fix-postgres-auth.md) | Corrigir Autenticação Postgres (Integração) | 🔥 Alta | `infra`, `fix` |
| [TASK-013](../tasks/stabilization/TASK-013-implement-report-rights-violation.md) | Implementar ReportRightsViolationUseCase | 🔥 Alta | `feature`, `app` |
| [TASK-023](../tasks/stabilization/TASK-023-fix-docker-injection-vulnerability.md) | Corrigir Vulnerabilidade no docker-compose | 🛡️ Alta | `security`, `fix` |
| [TASK-024](../tasks/quality/TASK-024-social-care-domain-review.md) | Endereçar achados do review Social Care | 🔥 Alta | `quality`, `domain` |
| [TASK-016](../tasks/modules/TASK-016-api-layer-setup.md) | Setup da Camada de API (Hono/Elysia) | 🔥 Alta | `feature`, `interface` |
| [TASK-014](../tasks/stabilization/TASK-014-fix-event-assertion-add-family-member.md) | Ajustar Asserção de Eventos (AddFamilyMember) | 🟡 Média | `test`, `fix` |
| [TASK-015](../tasks/quality/TASK-015-github-actions-ci-setup.md) | Configurar CI com GitHub Actions | 🟡 Média | `ci`, `infra` |
| [TASK-025](../tasks/stabilization/TASK-025-fix-handbook-paths.md) | Corrigir caminhos no Handbook | 🔵 Baixa | `docs`, `fix` |
| [TASK-019](../tasks/modules/TASK-019-analysis-bi-setup.md) | Setup do Módulo Analysis & Research | 🔵 Baixa | `feature`, `bi` |
| [TASK-020](../tasks/modules/TASK-020-form-conversions-setup.md) | Setup do Módulo Form Conversions | 🔵 Baixa | `feature`, `fmt` |

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
| [TASK-029](../tasks/quality/TASK-029-domain-fp-foundations.md) | Fundamentos para Domínio Funcional (FP) | 07/02/2026 | v0.3.0 |
| [TASK-030](../tasks/quality/TASK-030-domain-fp-value-objects.md) | Migração de Value Objects para FP | 07/02/2026 | v0.3.0 |
| [TASK-031](../tasks/quality/TASK-031-domain-fp-entities.md) | Migração de Entidades Filhas para FP | 07/02/2026 | v0.3.0 |
| [TASK-032](../tasks/quality/TASK-032-domain-fp-patient-aggregate.md) | Migração do Agregado Patient para FP | 07/02/2026 | v0.3.0 |
| [TASK-022](../tasks/quality/TASK-022-benchmarks-imutable-list.md) | Modernização e Benchmarks de ImutableList | 07/02/2026 | v0.2.0 |
| [TASK-023](../tasks/quality/TASK-023-modernize-typescript-libs.md) | Modernizar libs funcionais (Result/Option/Fn) | 07/02/2026 | v0.2.0 |
| [TASK-017](../tasks/backlog/TASK-017-aggregate-event-cleanup.md) | Implementar Limpeza de Eventos no Agregado | 06/02/2026 | - |
| [TASK-018](../tasks/backlog/TASK-018-outbox-pattern-implementation.md) | Implementar Outbox Pattern para Eventos | 06/02/2026 | - |
| [TASK-019](../tasks/backlog/TASK-019-command-pattern-migration.md) | Migrar Use Cases para Command Pattern | 06/02/2026 | - |
| [TASK-025](../tasks/backlog/TASK-025-decouple-interface-dtos-from-domain-enums.md) | Desacoplar DTOs da Interface dos Enums | 06/02/2026 | - |
| [TASK-026](../tasks/backlog/TASK-026-extract-persistence-mappers.md) | Extrair Mappers de Persistência | 06/02/2026 | - |
| [TASK-027](../tasks/backlog/TASK-027-handle-persistence-mapping-errors.md) | Tratar Erros de Mapping na Persistência | 06/02/2026 | - |
| [TASK-028](../tasks/backlog/TASK-028-response-mapper-layer.md) | Criar Response Mapper (Adapter Outbound) | 06/02/2026 | - |
| [TASK-026](../tasks/stabilization/TASK-026-refine-gitignore.md) | Refinar .gitignore (Ignorados indevidos) | 06/02/2026 | - |
| [TASK-021](../tasks/quality/TASK-021-remove-any-from-tests.md) | Remover `any` dos Testes Unitários | 05/02/2026 | v0.2.0 |
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
| - | **Migração para Monolito Modular** | 05/02/2026 | v0.2.0 |
| - | **Isolamento de Runtime (Ports & Adapters)** | 05/02/2026 | v0.2.0 |
