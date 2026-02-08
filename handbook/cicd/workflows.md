# Mapa de Workflows (CI/CD)

## Workflows atuais no repositório
- `.github/workflows/perf-benchmarks.yml`
  - Trigger: `push` em `main`.
  - Função: benchmark de performance (`ImutableList`).
- `.github/workflows/sync-kanban-project.yml`
  - Trigger: alterações em `handbook/KANBAN.md`, `handbook/tasks/**` e dispatch manual.
  - Função: sincronizar Kanban local com Issues/Project.
- `.github/workflows/ci-dev-pr.yml`
  - Trigger: `pull_request`.
  - Função: pipeline de `dev` (lint + testes) com Postgres via service container e migrations.
- `.github/workflows/notify-pr-discord.yml`
  - Trigger: abertura/reabertura/ready_for_review de PR.
  - Função: anúncio de PR no Discord via webhook.

## Workflows alvo (propostos)

### 1) CI de Pull Request (`ci-pr.yml`)
- Triggers: `pull_request` (opened, synchronize, reopened).
- Etapas:
  - setup de runtime/dependências;
  - lint + typecheck;
  - testes unitários/integrados;
  - cobertura (com limite mínimo).
- Resultado: bloqueia merge quando falhar.

### 2) Segurança de Código (`security-codeql.yml`)
- Triggers: `pull_request`, `push` em `main`, `schedule`.
- Escopo:
  - `CodeQL` focado em vulnerabilidades e padrões inseguros;
  - opcionalmente complementado com dependency scan.
- Resultado: findings críticos/altos bloqueiam promoção.

### 3) Deploy de Ambiente (`deploy-env.yml`)
- Triggers: `workflow_dispatch` (promoção explícita entre ambientes).
- Inputs: `source_env`, `target_env`, `version`.
- Regras:
  - valida pré-condições de promoção;
  - registra trilha de auditoria do deploy.

### 4) Release Oficial (`release.yml`)
- Triggers: criação de tag `v*` ou `release published`.
- Etapas:
  - build de artefato versionado;
  - validação de requisitos de TLS/config;
  - geração/publicação de release notes (path notes);
  - anúncio em Discord via webhook.

### 5) Deploy Produção (`deploy-prod.yml`)
- Trigger: promoção aprovada a partir de `release`.
- Regras:
  - environment protection com aprovadores;
  - smoke test pós-deploy;
  - rollback automatizável em caso de falha.

## Ativação por fase (time atual)
- Fase 1 (agora): `dev` ativo.
  - Ativo: `ci-dev-pr.yml` e `notify-pr-discord.yml`.
  - Mantido: `perf-benchmarks.yml` e `sync-kanban-project.yml`.
- Fase 2: habilitar `qa` e `pentest`.
- Fase 3: habilitar `release` e `prod` com aprovações formais.

## Secrets e variáveis (inventário inicial)
- `PROJECT_SYNC_TOKEN` (já utilizado para sync de Kanban).
- `SC_DB_USER`, `SC_DB_PASSWORD`, `SC_DB_NAME` (integração Postgres no CI de PR).
- `DISCORD_WEBHOOK_URL` (anúncio de release).
- `DISCORD_WEBHOOK_URL_PR` (anúncio de PR aberto/reaberto no Discord).
- `DEPLOY_SSH_KEY`/credencial equivalente por ambiente.
- Variáveis por ambiente:
  - endpoints, nomes de serviço, IDs de projeto, flags de feature.

## Política de manutenção
- Toda alteração de workflow deve atualizar este arquivo e o `handbook/KANBAN.md` quando houver impacto em escopo/prioridade.
- Mudanças em critérios de segurança devem registrar justificativa em `handbook/process/versioning.md` se afetarem contrato operacional.
