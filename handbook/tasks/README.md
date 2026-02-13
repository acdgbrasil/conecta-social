# Tasks — Índice Consolidado

Este arquivo consolida todas as tasks em `handbook/tasks/**`, elimina ambiguidades de numeração e define o status canônico por ID.

## Resumo (2026-02-08)
- Total: 42 tasks
- `Done`: 25
- `In Progress`: 2
- `To Do`: 16

## Normalização de IDs (removendo duplicidade)
Os IDs abaixo estavam duplicados em trilhas diferentes e foram renumerados para manter unicidade global:

| ID antigo | ID novo | Arquivo |
| :--- | :--- | :--- |
| `TASK-019` | `TASK-034` | `handbook/tasks/modules/TASK-034-analysis-bi-setup.md` |
| `TASK-023` | `TASK-035` | `handbook/tasks/stabilization/TASK-035-fix-docker-injection-vulnerability.md` |
| `TASK-025` | `TASK-036` | `handbook/tasks/stabilization/TASK-036-fix-handbook-paths.md` |
| `TASK-026` | `TASK-037` | `handbook/tasks/stabilization/TASK-037-refine-gitignore.md` |

## Status Canônico por Trilhas

### Social Care Completion
- `Done`: `TASK-001` a `TASK-009`, `TASK-011`
- `To Do`: `TASK-010`

### Backlog (Histórico já implementado)
- `Done`: `TASK-017`, `TASK-018`, `TASK-019`, `TASK-025`, `TASK-026`, `TASK-027`, `TASK-028`

### Quality
- `Done`: `TASK-015`, `TASK-021`, `TASK-022`, `TASK-023`, `TASK-029`, `TASK-030`, `TASK-031`, `TASK-032`, `TASK-048`
- `In Progress`: `TASK-024`, `TASK-033`

### Modules
- `To Do`: `TASK-016`, `TASK-020`, `TASK-034`

### Stabilization
- `Done`: `TASK-037`, `TASK-044`, `TASK-045`
- `To Do`: `TASK-012`, `TASK-013`, `TASK-014`, `TASK-035`, `TASK-036`, `TASK-038`, `TASK-039`, `TASK-040`, `TASK-041`, `TASK-042`, `TASK-043`, `TASK-046`, `TASK-047`

## TODO — Derivadas do PR #193 (2026-02-11)

- [ ] `PR193-TODO-01` Hardening de erros nos controllers HTTP: remover vazamento de mensagens internas e padronizar status por `error.http ?? 422` (em vez de comparar `error.code` com `"NOT_FOUND"`). -> **Mapeado em `TASK-044`**
- [ ] `PR193-TODO-02` Corrigir `await` ausente em `register-appointment.controller` para garantir leitura correta de `c.req.valid("json")`. -> **Mapeado em `TASK-044`**
- [ ] `PR193-TODO-03` Corrigir mapeamento `PatientMapper` (serialização/desserialização JSON, uso de `Option`, id do aggregate, `PersonId`, `reconstitute`, remoção de `any` e tipagem explícita de erro). -> **Mapeado em `TASK-045`**
- [ ] `PR193-TODO-04` Alinhar `patient.persistence.adapter` ao contrato do domínio/repositório (`PersonId` em assinaturas, erro de not found canônico, compatibilidade `findById` no port e fluxo correto de domain events/outbox). -> **Mapeado em `TASK-045`**
- [ ] `PR193-TODO-05` Adicionar testes de persistência para `save/find` cobrindo shape de dados, reconstituição e drift de mapeamento. -> **Mapeado em `TASK-048`**
- [ ] `PR193-TODO-06` Fortalecer testes do adapter HTTP: validar payload transformado e usar erros reais de fábrica (`DomainError`) em vez de objetos ad-hoc. -> **Mapeado em `TASK-048`**
- [ ] `PR193-TODO-07` Ajustar bootstrap do servidor: aplicar autenticação JWT de forma efetiva (ou remover import), revisar uso global de CSRF para API bearer-token, validar `PORT` numérico e manter versão OpenAPI sincronizada com release. -> **Mapeado em `TASK-046`**
- [ ] `PR193-TODO-08` Corrigir workflow `sync-kanban-project.yml` para usar token do Bitwarden em runtime (sem `${{ env.* }}` pré-avaliado), validar presença e propagar `GH_TOKEN` corretamente. -> **Mapeado em `TASK-047`**
- [ ] `PR193-TODO-09` Corrigir workflow `notify-pr-discord.yml` para consumir webhook do Bitwarden em runtime sem depender de `env` de expressão. -> **Mapeado em `TASK-047`**
- [ ] `PR193-TODO-10` Unificar fonte de verdade das credenciais de banco no `ci-dev-pr.yml` (Bitwarden x `secrets.*`) para evitar divergência entre serviço e steps. -> **Mapeado em `TASK-047`**
- [ ] `PR193-TODO-11` Endurecer `docker-compose` do Logto: remover default inseguro de `SECRET_VAULT_KEK`, exigir segredo externo e fixar tag de imagem (evitar `latest`). -> **Mapeado em `TASK-046`**
- [ ] `PR193-TODO-12` Corrigir artefatos Bruno (`REQUESTS_EXEMPLER`): auth por variável, placeholders OAuth2 coerentes, remoção de identificadores hardcoded e consistência de nome/método (`HEAD` vs `OPTIONS`). -> **Mapeado em `TASK-048`**
- [ ] `PR193-TODO-13` Alinhar governança de release e portabilidade de scripts: bump semântico de versão (minor para nova superfície API) e remover dependência rígida de `/bin/zsh` em script npm. -> **Mapeado em `TASK-048`**
- [ ] `PR193-TODO-14` Limpeza de consistência no adapter HTTP: remover import não usado e alinhar alias de `DomainError` ao padrão do projeto. -> **Mapeado em `TASK-044`**
- [ ] `PR193-TODO-15` Ajustar `daily-report-2026-02-11` para refletir estado real sobre uso de `any` (ou remover `any` do código antes). -> **Mapeado em `TASK-048`**
- [ ] `PR193-TODO-16` Triar comentários informativos de automação (Kody/Copilot) e registrar decisão de governança sobre quais tipos de comentários automáticos devem virar ação no backlog. -> **Mapeado em `TASK-048`**
