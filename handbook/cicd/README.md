# CI/CD — Estratégia e Governança

Este diretório consolida a estratégia de CI/CD do projeto, com foco em previsibilidade de deploy, segurança e rastreabilidade operacional.

## Objetivos
- Padronizar pipelines por ambiente (`dev`, `qa`, `pentest`, `release`, `prod`).
- Definir gates de qualidade (testes, lint, segurança e revisão).
- Formalizar release com versionamento, changelog e anúncio em Discord (webhook).
- Centralizar decisões sobre secrets, permissões e políticas de aprovação.

## Estado Atual (08/02/2026)
- Workflows existentes:
  - `.github/workflows/perf-benchmarks.yml` (benchmark em `push` para `main`).
  - `.github/workflows/sync-kanban-project.yml` (sincroniza `handbook/KANBAN.md` com Issues/Project).
- Lacunas atuais:
  - Não há pipeline de PR completo (lint + testes + cobertura + segurança).
  - Não há promoção formal entre ambientes.
  - Não há fluxo oficial de release com publicação de notas e anúncio.

## Decisões Alinhadas
- `CodeQL` será usado prioritariamente para segurança de código (não para substituir revisão funcional de PR).
- Deploys serão separados por estágios de risco:
  - desenvolvimento com automações de code review/checks;
  - QA e Pentest em ambientes seguros;
  - release com versão/TLS e path notes;
  - produção oficial com deploy automático controlado.
- Fase operacional atual (08/02/2026): apenas `dev` ativo, considerando equipe solo.

## Estrutura desta seção
- `handbook/cicd/environments.md` — desenho dos ambientes, critérios de promoção e controles.
- `handbook/cicd/workflows.md` — mapa de workflows (atuais e alvo), gatilhos e secrets.

## Relação com o Kanban
- Task base de CI: `handbook/tasks/quality/TASK-015-github-actions-ci-setup.md`.
- Novos desdobramentos de CI/CD devem virar tasks próprias no `handbook/KANBAN.md` quando aprovados.
