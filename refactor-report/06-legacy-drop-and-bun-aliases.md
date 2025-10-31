# Pós-refatoração — Corte do Legado e Tooling Sem `node_modules`

Este registro documenta a limpeza radical que elimina qualquer dependência da base legada anterior a 1.5 e consolida o monorepo para funcionar só com Bun, imports via alias e pacotes internos.

## Commits analisados
- Sessão atual (feature/1.5): remoção total de `packages/legacy` + ajuste de tooling/aliases para o modelo Bun-first.

## Diferenças principais em relação ao registro 05

- **1. Legado desconectado**  
  - `packages/legacy/**`, lockfile, schemas, testes `.bru` e `bin/legacy.sh` foram removidos por completo.  
  - `src/index.ts` agora reexporta apenas o que está vivo nos pacotes modernos (`packages/shared`, `packages/social/social-care`).
  - Documentação antiga (`MIGRATION_NOTES.md`) foi atualizada para refletir o novo estado sem ponte de compatibilidade.

- **2. Monorepo dependente só de Bun + aliases git/URL**  
  - `bunfig.toml` centraliza os aliases `@conecta/*`, permitindo `bun` resolver módulos internos sem `node_modules`.  
  - `tsconfig.json` define os mesmos aliases para o language service e remove `references` para o legado.  
  - Foi criado `types/bun-test.d.ts` para suprir o runner localmente (não dependemos mais de `bun-types` no `node_modules`).

- **3. Export surface estabilizado**  
  - `packages/shared/index.ts` expõe publicamente Result/Option/DomainError/Uuid/Fn, tornando-os reutilizáveis sem caminhos relativos.  
  - `packages/social/social-care/index.ts` e `value-objects/index.ts` padronizam a forma de consumir o domínio.  
  - Cada VO e catálogo de erro passou a usar os aliases (`@conecta/*`), incluindo a criação de `PersonId.error.ts`.

- **4. Tooling alinhado ao novo mundo**  
  - `.eslintignore`, `eslint.config.mjs` e `gitleaks.toml` perderam as exclusões específicas do legado.  
  - A documentação interna (`MIGRATION_NOTES.md`) foi rescrita para orientar o fluxo pós-1.5.

## Estado de testes
- `bun test` executa o suite de Value Objects normalmente.  
- Os testes de entidade em `packages/social/social-care/entities/__tests__` continuam RED (falha por módulos inexistentes), o que é esperado: são contratos para as futuras implementações das entidades pós-legado.

## Próximas ações sugeridas
- Implementar as entidades (`FamilyMember`, `Referral`, `SocialCareAppointment`, `RightsViolationReport`) ou mover os testes para um sandbox dedicado até que o domínio esteja pronto.  
- Revisar se outros pacotes do monorepo precisam de um `index.ts` público semelhante ao de `shared/` e `social-care/`.  
- Avaliar a criação de um `README` ou guia rápido explicando o fluxo de dependências via alias/Bun para novos membros do time.
