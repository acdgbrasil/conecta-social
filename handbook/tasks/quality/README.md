# Quality Tasks — Status Consolidado

Objetivo: manter a trilha de qualidade sincronizada com o estado real do código e evitar divergência com o `handbook/KANBAN.md`.

## Visão Geral (2026-02-08)
- Total de tasks: 10
- `Done`: 7 (`TASK-021`, `TASK-022`, `TASK-023`, `TASK-029`, `TASK-030`, `TASK-031`, `TASK-032`)
- `In Progress`: 2 (`TASK-024`, `TASK-033`)
- `To Do`: 1 (`TASK-015`)

## Índice Consolidado

### TASK-015 — CI GitHub Actions
Arquivo: `handbook/tasks/quality/TASK-015-github-actions-ci-setup.md`
- Status: `To Do`
- Situação real: existe workflow de performance (`.github/workflows/perf-benchmarks.yml`), mas ainda não existe o workflow de testes de PR com Postgres conforme critérios da task.

### TASK-021 — Remover `any` dos testes
Arquivo: `handbook/tasks/quality/TASK-021-remove-any-from-tests.md`
- Status: `Done`

### TASK-022 — Benchmarks de ImutableList no CI
Arquivo: `handbook/tasks/quality/TASK-022-benchmarks-imutable-list.md`
- Status: `Done`

### TASK-023 — Modernizar libs funcionais (Result/Option/Fn)
Arquivo: `handbook/tasks/quality/TASK-023-modernize-typescript-libs.md`
- Status: `Done`

### TASK-024 — Review de qualidade do domínio social-care
Arquivo: `handbook/tasks/quality/TASK-024-social-care-domain-review.md`
- Status: `In Progress`
- Pendências mapeadas no próprio arquivo:
  - validação por enums em `Referral`/`SocialCareAppointment`
  - correção do typo `hasRelevantDrugTheapy`

### TASK-029 — Fundamentos para domínio funcional (FP)
Arquivo: `handbook/tasks/quality/TASK-029-domain-fp-foundations.md`
- Status: `Done`

### TASK-030 — Migração de Value Objects para modelo funcional
Arquivo: `handbook/tasks/quality/TASK-030-domain-fp-value-objects.md`
- Status: `Done`

### TASK-031 — Migração de entidades filhas para modelo funcional
Arquivo: `handbook/tasks/quality/TASK-031-domain-fp-entities.md`
- Status: `Done`

### TASK-032 — Migração do agregado Patient para modelo funcional
Arquivo: `handbook/tasks/quality/TASK-032-domain-fp-patient-aggregate.md`
- Status: `Done`

### TASK-033 — Limpeza de code smells do domínio
Arquivo: `handbook/tasks/quality/TASK-033-domain-code-smell-cleanup.md`
- Status: `In Progress`
- Situação real: escopo estrutural já implementado; falta estabilização da suíte completa da camada `application` para fechamento total.
