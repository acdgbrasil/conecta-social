# [TASK-012] Corrigir Autenticação Postgres (Integração)

**Status:** 🟢 Done
**Prioridade:** 🔥 Alta
**Labels:** `infra`, `fix`

## Descrição
Os testes de integração estão falhando com o erro `PostgresError: password authentication failed for user "admin"`.

## Causa Provável
- Divergência entre a senha configurada no `docker-compose.yml` e a injetada pelo Bitwarden Secrets Manager (`bws`).
- Em Postgres inicializado previamente, troca de `POSTGRES_PASSWORD` não é aplicada só com restart; é necessário recriar o volume.

## Critérios de Aceite
- [x] Credenciais sincronizadas.
- [x] Comando `bun run test:infra` executado com sucesso (passando no login).

## Progresso Atual
- [x] Criado teste real de autenticação em `src/modules/social-care/interface/tests/integration/postgres-auth.spec.ts` (`SELECT 1` + validação de usuário/database).
- [x] Ajustado script `test:infra` para apontar para diretório de integração com teste existente.
- [x] Adicionado script `infra:reset-db` para recriação de volume (`docker compose down -v`) e subida limpa do Postgres.
- [x] Validar `bun run infra:reset-db` seguido de `bun run test:infra` no ambiente com `bws` ativo.

## Evidências
- `bun run infra:reset-db` executado com sucesso (recriação de volume + subida de `social-care-db`).
- `bun run test:infra` executado com sucesso após fix de host/porta local.
- Causa consolidada: `bws` injeta `SC_DB_PORT=5432` (padrão CI), enquanto compose local expõe `5433`.
- Mitigação aplicada: script local força `SC_DB_HOST=127.0.0.1` e `SC_DB_PORT=5433` durante o teste de infra.
