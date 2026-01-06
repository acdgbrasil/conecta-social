# Versionamento e Retrocompatibilidade

## Esquema vigente (SemVer)
A partir deste canal iniciamos em **`0.1.0`** e seguimos [SemVer](https://semver.org/) padrão (`MAJOR.MINOR.PATCH`).

- **MAJOR** — alterações incompatíveis nos pacotes publicados (`@conecta/result`, `@conecta/social-care`, eventos, schemas persistidos). Só subir após concluir plano de migração.
- **MINOR** — novas capacidades retrocompatíveis (APIs opcionais, novos value objects, catálogos de erro adicionais).
- **PATCH** — correções, hardening ou ajustes de toolchain que não expõem novas APIs.

Enquanto estivermos em `0.y.z`, trate qualquer quebra como aumento de `MINOR` e documente explicitamente o impacto antes do merge.

### Recomendações práticas
- Use `bun pm version <patch|minor|major>` para atualizar `package.json` na raiz **e** cada pacote tocado em `packages/**`. Atalhos: `bun run version:patch|minor|major|prerelease` (scripts/version.ts).
- Gere tags anotadas (`git tag -a v0.1.0 -m "Conecta Social kick-off"`). As tags são a origem do changelog.
- Inclua o número da versão no PR/commit final e referencie o relatório correspondente (`reports/daily` ou `reports/refactor`).

## Checklist por PR
1. **Classificar mudança** (patch/minor/major) olhando o que saiu pelos barrels (`src/index.ts`, `packages/*/index.ts`).
2. **Atualizar versões**: raiz + pacotes afetados.
3. **Changelog/relatório**: registrar resumo e motivação em `reports/daily/*.md` ou `reports/refactor/*.md`.
4. **Garantir suíte verde** (`bun test`). Sem testes passando, não há versão.
5. **Sincronizar handbook**: qualquer alteração de contrato precisa refletir `handbook/codebase/**` e `process/retrocompatibilidade.md`.

## Retrocompatibilidade
1. **Contrato público imutável**: não remova APIs/eventos publicados antes de oferecer alternativa e janela de convivência.
2. **Soft deprecation**: registrar no quadro (`process/retrocompatibilidade.md`) quando algo entra em descontinuação.
3. **Teste obrigatório**: toda correção gera teste (unit ou regression). Sem teste, a ruptura não pode ser mergeada.
4. **Janela mínima**: mantenha recursos deprecados por, pelo menos, duas versões `MINOR`.

## Artefatos de apoio
- `process/retrocompatibilidade.md` — catálogo de features, status e plano de migração.
- `reports/refactor/*.md` — contexto de decisões estruturais.
- `reports/daily/*.md` — log operacional das execuções de teste e releases.
- `scripts/version.ts` — wrapper leve para `bun pm version` + lembrete de changelog/tag.
