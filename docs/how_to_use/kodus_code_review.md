# Kodus Code Review Setup — Conecta Social

Use este guia para habilitar o Kodus como revisor automático, complementando o Copilot.

## 1. Permissões (FGPAT)
1. Siga `handbook/tooling/docs/how_to_use/en/code_review/general_config/github_pat.mdx`:
   - Gere um Fine-Grained Personal Access Token (FGPAT) com acesso à organização.
   - Permissões mínimas: Contents (read/write), Pull requests (read/write), Commit statuses (read), Issues (read).
2. Adicione o token no painel do Kodus (`Automations → Code Review → Global Settings`).
3. Verifique se o token aparece com o logo da organização e sem data expirada (veja os alertas em `.../troubleshooting.mdx`).

## 2. Configuração do Repositório
1. Habilite "Auto-sync rules from repo" ou deixe que o arquivo `.kody/kodus-config.yml` (com `kodusConfigFileOverridesWebPreferences: true`) governe as preferências.
2. Defina os branches relevantes (`main`, `develop`, etc.) no arquivo `.kody/kodus-config.yml` ou na interface web.
3. Configure diretórios específicos se necessário (`configs/directory_level.mdx`) — caso contrário o repositório usará o config central.

## 3. Regras Disponíveis
As seguintes regras vivem em `.kody/rules/`:
- `domain-boundaries.md` — reforça limites DDD no contexto Social Care.
- `tests-as-documentation.md` — exige testes (unit/regression) acompanhando mudanças.
- `versioning-and-handbook.md` — valida bump de versão e updates no handbook.
- `bun-runtime.md` — impede reintrodução de `node_modules` ou comandos `npm/yarn`.

Kodus sincroniza automaticamente após merge; use `@kody-sync` se precisar forçar sincronização manual.

## 4. Fluxo de Revisão
1. Abrir PR → Kodus executa review automático (se automations estiverem ativas) ou invoque `@kody start-review`.
2. Para validar regras de negócio específicas, utilize `@kody -v business-logic <link-ou-spec>` (ver `business_logic_validation.mdx`).
3. Kodus reporta violações de regras, faltas de testes, ausência de documentação/versão. Trate cada alerta antes do merge.
4. Para execução automática no CI, configure o secret `KODUS_FGPAT` e habilite o workflow `.github/workflows/kodus-review.yml` (ele invoca `bunx kodus-cli review`).
5. Se o review não iniciar, consulte `troubleshooting.mdx` (token, branches, limites).

## 5. Boas Práticas
- Pequenos PRs — Kodus é mais eficaz com mudanças segmentadas.
- Atualize o handbook antes de solicitar review para evitar falsos positivos.
- Reexecute `@kody start-review` após ajustes significativos ou merge de branch base.

Com isso, Kodus passa a agir como guardião das políticas definidas no handbook, garantindo que PRs só avancem quando testes, documentação e versionamento estiverem em ordem.
