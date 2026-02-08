# [TASK-042] Corrigir `DeepReadonly` para Preservar Funções com Argumentos

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `type-safety`, `shared`, `typescript`
**Origem:** PR #148 review (Kody AI)

## Descrição
O tipo utilitário `DeepReadonly` usa uma verificação de função restritiva (`(...args: never[])`), o que pode quebrar assinaturas de funções com parâmetros.

## Comentários Relacionados (PR #148)
- `src/shared/fn-pattern/types.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226269

## Tarefas
- [ ] Ajustar o branch de função no `DeepReadonly` para cobrir funções com quaisquer argumentos.
- [ ] Adicionar/atualizar testes de tipo para garantir que funções continuam invocáveis após `DeepReadonly`.
- [ ] Revisar impacto em tipos de domínio que usam callbacks.

## Critérios de Aceite
- [ ] `DeepReadonly` mantém call signature de funções com argumentos.
- [ ] Testes de tipo relevantes passam sem regressão.
