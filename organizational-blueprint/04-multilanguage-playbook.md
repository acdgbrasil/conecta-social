# 04 — Multilanguage Playbook

Objetivo: replicar este monorepo em ambientes com múltiplas linguagens/runtimes (ex.: TS + Go + Python) mantendo governança comum.

## Princípios
1. **Contextos isolam a linguagem**: cada bounded context escolhe a linguagem que melhor representa o domínio, mas exporta contratos consistentes (DTOs, eventos, schema GraphQL/HTTP, etc.).
2. **Infra compartilhada**: lint, security (gitleaks), formatação e documentação continuam centralizados na raiz.
3. **Interop mínima**: comunicação entre linguagens ocorre via boundaries explícitas (mensageria, adapters HTTP) definidos em `src/` ou `packages/shared` quando possível.

## Estrutura Sugerida
```
packages/
├─ ts/
│  ├─ social/social-care
│  └─ queue_manager
├─ go/
│  └─ <contexto-go>
├─ py/
│  └─ <contexto-python>
└─ shared/
   ├─ ts/*
   ├─ go/*
   └─ py/*
```
> Se preferir não separar por linguagem, mantenha o padrão atual e indique a linguagem no README do pacote.

## Toolchains
- **TypeScript/Bun** já configurados (`bunfig.toml`, `tsconfig.json`).
- **Novas linguagens** devem adicionar arquivos equivalentes (ex.: `go.work`, `pyproject.toml`) e scripts padronizados (`make` ou `justfile`).
- Documente cada setup em `handbook/tooling/<linguagem>/README.md`.

## Integração
1. **Contratos compartilhados** vão para `types/` ou outra pasta neutra e são gerados para cada linguagem (ex.: via OpenAPI, Buf, codegen customizado).
2. **Pipelines**: configure jobs por linguagem, mas compartilhe etapas de segurança (gitleaks, licenças).
3. **Releases**: use semver interno ou tags específicas (`social-care@ts-v1.3.0`, `triage@go-v0.4.0`).

## Checklist para adicionar uma nova linguagem
- [ ] Criar diretório sob `packages/<ling>/` ou documentar a linguagem no README do pacote.
- [ ] Adicionar comandos de build/test ao orchestrator (Bun scripts, Makefile, etc.).
- [ ] Expor aliases/resolvers se houver interop com TypeScript (`tsconfig`, `bunfig`).
- [ ] Atualizar `organizational-blueprint` e `handbook/tooling` com instruções da linguagem.
- [ ] Revisar segurança (linters, formatters, secret scanning) para o novo stack.

> Ao seguir os mesmos princípios (handbook vivo + testes RED + governance centralizada), a adição de novas linguagens mantém o monorepo coerente e previsível.
