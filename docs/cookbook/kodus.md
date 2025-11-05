# Kodus Cookbook — Conecta Social

Use este guia como playbook de revisão. Cada receita cobre atividades que o Kodus deve executar automaticamente (ou exigir do autor) antes do merge.

## Receita 1 — Nova feature de domínio
1. **Validar boundaries**
   - Confirmar que o código vive em `packages/social/social-care` (ou contexto adequado) e importa apenas via barrels.
   - Checar se eventos/erros foram atualizados (`handbook/principles/context-map.md`, `handbook/process/retrocompatibilidade.md`).
2. **Garantir versão e docs**
   - Bump em `package.json` (root e pacotes afetados) no formato `MAJOR.MINOR.FEATURE.PATCH`.
   - Atualização do handbook (`handbook/principles`, `handbook/reports`, etc.) explicando a mudança.
3. **Rodar testes necessários**
   ```bash
   bun test packages/social/social-care/tests/unit/value-objects --filter "<nome-do-vo>"
   bun test packages/social/social-care/tests/unit/entities --filter "<nome-da-entidade>"
   bun test packages/social/social-care/tests/regression
   ```
4. **Checklist final**
   - Nenhum `todo`/`skip`.
   - Nenhum import relativo para fora do contexto.

## Receita 2 — Correção de bug (regressão)
1. **Identificar o teste RED**
   - Deve existir/ser criado em `tests/regression`.
2. **Aplicar correção**
   - Implementar fix respeitando imutabilidade e DDD.
3. **Executar testes**
   ```bash
   bun test packages/<context>/tests/regression --filter "<slug-do-bug>"
   bun test packages/<context>/tests/unit --filter "<componente-toque>"
   ```
4. **Documentar**
   - Atualizar `handbook/quality/quality-plan.md` se for falha listada.
   - Registrar decisão em `handbook/reports/daily` ou `reports/refactor`.

## Receita 3 — Atualização de utilitário compartilhado
1. **Impacto**
   - Mapear pacotes dependentes (`rg '@conecta/<util>' packages`).
2. **Testes mínimo**
   ```bash
   bun test packages/shared/tests/unit --filter "<util>"
   bun test packages/social/social-care/tests/unit/value-objects
   bun test packages/social/social-care/tests/unit/entities
   ```
3. **Docs**
   - Atualizar handbook se a API pública mudar.
4. **Versão**
   - Incrementar versão dos pacotes consumidores, se comportamento mudar.

## Receita 4 — Alterações de config/tooling
1. **VS Code / Debug**
   - Validar que `.vscode/settings.json` continua apontando para `${env:BUN_INSTALL}` e não cria dependência de `node_modules`.
2. **CI / GitHub**
   - Verificar se configurações replicam convenções do handbook.
3. **Testes**
   - No mínimo `bun test` completo ou subset afetado.

## Receita 5 — Verificação pré-merge
1. `git status` limpo (sem artefatos `coverage/`, `bun-test.xml`, etc.).
2. `bun test` (ou subconjuntos relevantes) passando.
3. `bun install --frozen-lockfile` não altera `bun.lock`.
4. Versão ajustada, docs atualizados, changelog (se houver) sincronizado.

> **TIP:** Todo feedback deve apontar caminhos claros (`path/to/file.ts:line`). Exija correções imediatas quando qualquer checklist acima falhar.
