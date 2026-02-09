# [TASK-038] Corrigir Ordem de Exports nos Barris da API Pública

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `bug`, `api`, `barrel`
**Origem:** PR #148 review (Kody AI)

## Descrição
A revisão apontou risco de colisão/sombreamento de exports por ordem inadequada em arquivos de barril (`index.ts`), com impacto potencial na API pública consumida por outros módulos.

## Comentários Relacionados (PR #148)
- `src/index.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777225941

## Tarefas
- [x] Revisar a ordem de exportação em `src/index.ts` e barris relacionados.
- [x] Garantir precedência consistente entre `shared` e módulos de domínio sem ambiguidade de símbolos (Shared movido para o topo).
- [x] Validar que não há export conflitante silencioso ao consumir o pacote raiz.
- [x] Adicionar teste/smoke check de import da API pública para detectar regressões.

## Critérios de Aceite
- [x] API pública do pacote raiz resolve os símbolos esperados sem colisão.
- [x] Ordem de exportação documentada e estável para evolução futura.
