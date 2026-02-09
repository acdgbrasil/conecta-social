# Migration Notes — Monorepo 1.5

## Contexto
- O pacote legado (`packages/legacy/**`) foi removido por completo.
- Toda a surface pública do monorepo está exposta através dos barrels:
  - `src/shared/index.ts`
  - `src/modules/social-care/index.ts`
- O arquivo `src/index.ts` reexporta esses módulos para consumo externo.

## Estrutura atual
```txt
src/
├─ shared/
│  ├─ fn-pattern/
│  ├─ option-pattern/
│  ├─ result-pattern/
│  ├─ erros-pattern/
│  ├─ ports/
│  └─ tests/
└─ modules/
   └─ social-care/
      ├─ application/
      ├─ domain/
      ├─ interface/
      └─ tests/
```

- As dependências internas devem ser acessadas via aliases `@conecta/*` definidos em `bunfig.toml` e `tsconfig.json`.
- Testes vivem em `src/shared/tests/**` e `src/modules/social-care/**/tests/**` seguindo o padrão do handbook.

## Ações para equipes que ainda dependiam do legado
1. Revisar implementações para remover imports relativos apontando para `packages/legacy`.
2. Migrar instâncias utilitárias para os módulos exportados por aliases `@conecta/*` (ex.: `@conecta/fn`, `@conecta/result`).
3. Atualizar scripts locais para usar `bun test`/`bun run` com o novo `bunfig.toml`.
4. Verificar se pipelines CI/CD não fazem referência ao lockfile antigo (`bun.lock`).

## Próximos passos sugeridos
- Completar a implementação das entidades do agregado `Patient` conforme contratos de teste.
- Manter documentação e diários em `handbook/reports` alinhados com as decisões de domínio.
