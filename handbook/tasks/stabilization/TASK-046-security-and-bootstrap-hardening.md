# [TASK-046] Endurecimento de Segurança e Bootstrap

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `security`, `infra`, `stabilization`
**Origem:** Derivadas do PR #193 (`PR193-TODO-07`, `11`)

## Descrição
Ajustar bootstrap do servidor e segurança de infraestrutura (Docker) para alinhar com as políticas de segurança do projeto.

## Tarefas
- [x] Ajustar bootstrap: autenticação JWT efetiva, CSRF para bearer-token, validar `PORT` numérico e sincronizar OpenAPI.
- [x] Endurecer Docker Logto: remover `SECRET_VAULT_KEK` default, exigir segredo externo e fixar tags de imagem (evitar `latest`).

## Critérios de Aceite
- [x] Servidor não sobe se `PORT` for inválido ou segredos estiverem ausentes.
- [x] Docker compose sem tags `latest`.

## Implementação
**Data:** 2026-02-11  
**Commit:** (pendente)  
**Arquivos alterados:**
- `src/server.ts` - Validações de bootstrap
- `docker-compose.yml` - Hardening de segurança
- `.env.example` - Documentação de configuração
- `src/tests/bootstrap.security.spec.ts` - Testes automatizados
- `handbook/process/bitwarden-secrets-manager.md` - Guia completo Bitwarden
- `handbook/process/bitwarden-quick-reference.md` - Referência rápida

## Secrets Management (Bitwarden)
**Status:** ✅ Documentado (já implementado nos workflows)  
Os workflows já usam **Bitwarden Secrets Manager** (`bitwarden/sm-action@v2`):
- `ci-dev-pr.yml` - DB credentials via Bitwarden
- `sync-kanban-project.yml` - GitHub token via Bitwarden
- `notify-pr-discord.yml` - Discord webhook via Bitwarden

**Guia completo:** `handbook/process/bitwarden-secrets-manager.md`
