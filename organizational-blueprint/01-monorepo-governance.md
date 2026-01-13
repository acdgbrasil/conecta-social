# 01 — Monorepo Governance

## Estrutura de Raiz
- `package.json` usa workspaces globais (`packages/*` e `packages/*/*`) para incluir contextos de negócio e bibliotecas internas.
- Arquivos utilitários na raiz (`bunfig.toml`, `eslint.config.mjs`, `gitleaks.toml`, `tsconfig.json`) definem políticas únicas para todo o repo.
- `types/` e `src/` hospedam código cross-context (gateways, adapters ou scripts compartilhados).

### Convenções Gerais
1. **Configuração única por ferramenta** (ESLint, Bun, Gitleaks) com overrides locais apenas quando inevitável.
2. **Paths TS centralizados** (`tsconfig.json`) expondo cada pacote como alias (`@conecta/social-care`, `@conecta/queue-core`, ...).
3. **CI mínima**: scripts compostos através do Bun; cada pacote adiciona seus próprios `tests/` ao invés de depender de ad hoc scripts.

## Pacotes
```
packages/
├─ shared/              → padrões reutilizáveis (Result, DomainError, Option, UUID, Fn, ...)
├─ social/social-care/  → primeiro bounded context implementado
├─ queue_manager/       → próximo contexto, iniciando pelos testes RED
└─ ui/                  → (placeholder) camadas de front/experiments
```

- **Shared patterns**: cada subpasta exporta via `index.ts` e é registrada no `tsconfig`. Mantém pureza funcional e zero dependências de domínio.
- **Contextos de domínio** carregam suas entidades/VOs/erros e um diretório de `tests/` documentais.
- **Protocolos e adaptadores**: dependências externas/configuráveis (relógio, UUID, notificações, bus de eventos) ganham interface em `packages/shared/protocols/*` e implementações padrão em `packages/shared/adapters/*`. Contextos consomem o protocolo, não a implementação.
- **Novos contextos** devem repetir esta estrutura (camada de domínio + pasta `tests` + entrada em `tsconfig`).

## Padrões de Nome e Caminho
| Elemento           | Convenção                            | Exemplo                                    |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| Pacote             | `packages/<bc>/<nome-contexto>`      | `packages/conecta-raros/social-care`              |
| Tests              | `packages/<bc>/<contexto>/tests`     | `packages/conecta-raros/social-care/tests`        |
| Shared Pattern     | `packages/shared/<pattern>-pattern`  | `packages/shared/result-pattern`           |
| Alias TS           | `@conecta/<contexto>`                | `@conecta/queue-core`                      |

## Fluxo de Trabalho
1. **Planejar** em `handbook/` (domínio, princípios, reports).
2. **Codificar** no pacote correspondente, usando apenas dependências expostas pelos aliases.
3. **Documentar via testes** (RED → implementação → GREEN) com Bun.
4. **Atualizar handbook** se novas regras surgirem.

> Para portar este modelo, replique a árvore acima, adicione novos pacotes às workspaces e mantenha a raiz como fonte da verdade das ferramentas.
