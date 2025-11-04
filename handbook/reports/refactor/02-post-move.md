# Pós-movimentação

## Scripts executados
1. `bun run typecheck` (executado dentro de `packages/legacy/`) → ✅ sucesso (sem saídas adicionais)
2. `bun run lint` (dentro de `packages/legacy/`) → ❌ falha: `bun is unable to write files to tempdir: AccessDenied` (depende de instalar `eslint`/`typescript-eslint`)
3. `bun run build` → não existe script definido (inalterado)
4. `bun run dev` → ❌ falha: `Failed to start server. Is port 3000 in use?` (mesmo erro observado antes da migração)
5. `bun run start` → ❌ falha: `Failed to start server. Is port 3000 in use?` (mesmo erro observado antes da migração)
6. `bun run test` → ❌ falha: "No tests found" (comportamento pré-existente)

## Observações
- `bun install` não pôde ser executado devido à restrição de escrita em diretório temporário; rodar localmente fora do sandbox para baixar `eslint` e `typescript-eslint` e atualizar `bun.lock`.
- Lint permanece configurado para ignorar `packages/legacy/**`; basta instalar as dependências para que funcione.
- Os erros em `dev`/`start` indicam porta 3000 ocupada (mesma mensagem do inventário).
