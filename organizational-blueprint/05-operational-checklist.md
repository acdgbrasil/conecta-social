# 05 — Operational Checklist

Use esta lista para bootstrapar um projeto inspirado no `conecta-social`.

## Fase 0 — Setup
- [ ] Clonar estrutura de pastas (`packages`, `handbook`, `types`, `src`).
- [ ] Copiar configs raiz (`bunfig.toml`, `eslint.config.mjs`, `gitleaks.toml`, `tsconfig.json`).
- [ ] Definir workspaces no `package.json` e garantir que cada novo pacote tenha `index.ts` e `tests/`.

## Fase 1 — Handbook
- [ ] Criar `handbook/principles`, `handbook/domain_questions`, `handbook/process`, `handbook/quality`, `handbook/tooling`, `handbook/reports`.
- [ ] Registrar pelo menos um documento de domínio completo (modelo no `queue_domain.md`).
- [ ] Adicionar guia de testes/princípios (inspiração em `handbook/principles/testing-and-domain.md`).

## Fase 2 — Shared Kernel
- [ ] Portar `packages/shared` necessários (Result, DomainError, Option, UUID, Fn).
- [ ] Configurar aliases no `tsconfig` (e equivalentes para outras linguagens se existirem).
- [ ] Escrever README curto para cada pattern explicando o uso.

## Fase 3 — Contextos de Domínio
- [ ] Criar pacote `packages/<area>/<contexto>` com subpastas `entities`, `value-objects`, `err`, `tests`.
- [ ] Escrever `tests/README.md` e primeiros testes RED descrevendo invariantes.
- [ ] Disponibilizar API pública no `index.ts`.

## Fase 4 — Multi Linguagem (quando aplicável)
- [ ] Acrescentar diretórios por linguagem (`packages/go`, `packages/py`, etc.) e respectivos toolings.
- [ ] Atualizar `organizational-blueprint/04-multilanguage-playbook.md` com decisões reais.

## Fase 5 — Operação Contínua
- [ ] Manter reports de code review/daily em `handbook/reports/*`.
- [ ] Usar testes como documentação viva (cada regra -> referência ao handbook).
- [ ] Revisitar princípios trimestralmente e registrar mudanças.

> Complete cada fase sequencialmente para garantir que a base organizacional esteja pronta antes de adicionar novas features ou linguagens.
