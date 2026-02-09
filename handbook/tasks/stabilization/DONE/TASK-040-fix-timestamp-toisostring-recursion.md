# [TASK-040] Corrigir Recursão em `Timestamp.toISOString`

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `bug`, `domain`, `value-object`
**Origem:** PR #148 review (Kody AI)

## Descrição
A função `Timestamp.toISOString` estava implementada chamando `self.toISOString()`, com risco de recursão infinita e `stack overflow`.

## Comentários Relacionados (PR #148)
- `src/modules/social-care/domain/value-objects/timestamp.valueObject.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226075

## Tarefas
- [x] Ajustar implementação para chamada explícita do método nativo (`Date.prototype.toISOString.call(self)`).
- [x] Adicionar teste unitário cobrindo `Timestamp.toISOString`.
- [x] Validar ausência de regressão nos usos de `Timestamp` no domínio.

## Critérios de Aceite
- [x] `Timestamp.toISOString` retorna ISO válido sem recursão.
- [x] Testes de `timestamp.valueObject` cobrindo o cenário passam.
