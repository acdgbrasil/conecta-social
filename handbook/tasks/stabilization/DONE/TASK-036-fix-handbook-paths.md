# [TASK-036] Corrigir caminhos no Handbook (Migration Notes)

**Status:** 🟢 Done
**Prioridade:** 🔵 Baixa
**Labels:** `docs`, `fix`
**Origem:** PR #147 review

## Descrição
O arquivo `handbook/reports/refactor/00-migration-notes-log.md` refere-se a caminhos inexistentes ou antigos como `packages/social/conecta-raros/`.

## Comentários Relacionados (PR #148)
- `handbook/codebase/shared/fn-pattern/documentation.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198815
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198823
- `handbook/architecture/mapper-problems.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198846
- `handbook/domain_questions/social_care/05-integrations-context.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198853
- `handbook/domain_questions/social_care/README.md`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777198857

## Tarefas
- [x] Atualizar referências para `src/modules/social-care/` e `src/shared/`.
- [x] Alinhar exemplos de import para aliases reais (`@conecta/*`) em `handbook/codebase/shared/fn-pattern/documentation.md`.
- [x] Atualizar `handbook/architecture/mapper-problems.md` movendo itens já concluídos para seção de resolvidos.
- [x] Alinhar contrato de repositório em `handbook/domain_questions/social_care/05-integrations-context.md` com a porta atual (sem `addFamilyMember`).
- [x] Corrigir caminho legado em `handbook/domain_questions/social_care/README.md`.

## Critérios de Aceite
- [x] Documentação consistente com a estrutura atual de Monolito Modular.
- [x] Sem exemplos com alias inexistente `@/shared/...` nos documentos afetados.

## Evidências
- `handbook/reports/refactor/00-migration-notes-log.md` atualizado para estrutura `src/**`.
- `handbook/codebase/shared/fn-pattern/documentation.md` atualizado para imports `@conecta/*`.
- `handbook/architecture/mapper-problems.md` revisado com status real dos itens resolvidos/parciais.
- `handbook/domain_questions/social_care/05-integrations-context.md` alinhado com `PatientRepositoryPort` atual.
- `handbook/domain_questions/social_care/README.md` corrigido para caminhos/aliases atuais.
