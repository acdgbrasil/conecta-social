---
title: "Bun-First Runtime"
scope: "pull_request"
path: ["**/*"]
severity_min: "medium"
buckets: ["tooling"]
enabled: true
uuid: "f0a1c1af-0fb9-4f0e-8b85-96c77dfff877"
---

## Instructions
O repositório usa Bun como runtime padrão. Garanta que nenhum PR reintroduza dependências de `node_modules` ou comandos `npm/yarn`.
- Scripts e instruções devem usar `bun` (`bun test`, `bun run`, `bun install --frozen-lockfile`).
- Verifique se `.gitignore` continua ignorando `node_modules/`.
- Rejeite commits que adicionam `package-lock.json`, `yarn.lock` ou referências a `npm install`.
- Configurações de debug/IDE devem apontar para `${env:BUN_INSTALL}` ou scripts Bun existentes.

## Examples

### Bad example
```
docs/README.md instrui rodar `npm install` e `npm test`.
```

### Good example
```
Novo script documenta `bun test packages/social/social-care/tests/unit/entities`.
```
