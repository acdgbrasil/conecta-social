# [TASK-047] Estabilização de Workflows e Segredos (CI/CD)

**Status:** 🔴 To Do
**Prioridade:** 🟡 Média
**Labels:** `ci`, `automation`, `stabilization`
**Origem:** Derivadas do PR #193 (`PR193-TODO-08`, `09`, `10`)

## Descrição
Corrigir e estabilizar workflows do GitHub Actions para uso seguro de segredos do Bitwarden e unificação de credenciais.

## Tarefas
- [ ] Corrigir `sync-kanban-project.yml` para usar token do Bitwarden em runtime.
- [ ] Corrigir `notify-pr-discord.yml` para consumir webhook do Bitwarden em runtime sem depender de `env` de expressão.
- [ ] Unificar fonte de verdade das credenciais de banco no `ci-dev-pr.yml`.

## Critérios de Aceite
- [ ] Workflows rodando com sucesso sem exposição de variáveis pré-avaliadas em logs.
