# [TASK-042] Corrigir `DeepReadonly` para Preservar Funções com Argumentos

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `type-safety`, `shared`, `typescript`
**Origem:** PR #148 review (Kody AI)

## Descrição
O tipo utilitário `DeepReadonly` usava uma verificação de função restritiva (`(...args: never[])`), o que podia quebrar assinaturas de funções com parâmetros em certas versões do compilador ou configurações estritas.

## Comentários Relacionados (PR #148)
- `src/shared/fn-pattern/types.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226269

## Tarefas
- [x] Ajustar o branch de função no `DeepReadonly` para cobrir funções com quaisquer argumentos.
- [x] Adicionar/atualizar testes de tipo para garantir que funções continuam invocáveis após `DeepReadonly`.
- [x] Revisar impacto em tipos de domínio que usam callbacks.

## Critérios de Aceite
- [x] `DeepReadonly` mantém call signature de funções com argumentos.
- [x] Testes de tipo relevantes passam sem regressão.
