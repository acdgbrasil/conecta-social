# PR Description: Fechamento da Trilha de Stabilization e Consolidação do Handbook

## Resumo
Este PR fecha a rodada de estabilização do `social-care` com foco em:
- validação da integração Postgres,
- consolidação do contrato de domínio/eventos,
- correções de documentação e Kanban,
- padronização de scripts de automação para Python.

## Entregas Principais

### Stabilization concluída
- `TASK-012`: autenticação Postgres em integração corrigida e fluxo local de infra validado.
- `TASK-013`: `ReportRightsViolationUseCase` implementado e coberto por testes.
- `TASK-014`: ajuste de asserções de eventos em `AddFamilyMember`.
- `TASK-036`: caminhos e referências do handbook atualizados para estrutura real de `src/modules/social-care` e `src/shared`.
- `ANL-002`: baseline de TypeScript recuperada com `bunx --bun tsc --noEmit` verde.

### Documentação e governança técnica
- Atualização de `handbook/KANBAN.md` com cards movidos para `Done`.
- Revisão dos documentos de arquitetura e domínio para eliminar paths legados e inconsistências de contrato.
- Registro dos resultados em `handbook/reports/**` para fechamento de branch.

### Tooling/scripts
- Padronização da pasta `scripts/**` para Python:
  - remoção de `scripts/version.ts`,
  - criação de `scripts/version.py`,
  - atualização dos atalhos `version:*` no `package.json`,
  - atualização da referência em `handbook/process/versioning.md`.

## Verificação executada
- `bun run infra:reset-db`
- `bun run test:infra`
- `python3 scripts/version.py --help`
- `python3 scripts/version.py patch --dry-run`
- `bun run version:patch -- --dry-run`
- `python3 scripts/sync_kanban_github.py --help`
- `python3 scripts/sync_kanban_github.py --repo acdgbrasil/conecta-social --project-owner acdgbrasil --project-number 10 --dry-run` (bloqueado neste ambiente por indisponibilidade de rede para `api.github.com`)

## Impacto
- Reduz risco de regressão na integração com Postgres.
- Mantém o Kanban e reports como fonte confiável de status.
- Unifica automação em uma linguagem de script (`Python`), simplificando manutenção.
