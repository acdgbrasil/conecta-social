# [TASK-012] Corrigir Autenticação Postgres (Integração)

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `infra`, `fix`

## Descrição
Os testes de integração estão falhando com o erro `PostgresError: password authentication failed for user "admin"`.

## Causa Provável
- Divergência entre a senha configurada no `docker-compose.yml` e a injetada pelo Bitwarden Secrets Manager (`bws`).
- O container pode precisar de um restart para aplicar as variáveis de ambiente corretas.

## Critérios de Aceite
- [ ] Credenciais sincronizadas.
- [ ] Comando `bun run test:infra` executado com sucesso (passando no login).
