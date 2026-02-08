# [TASK-040] Corrigir Recursão em `Timestamp.toISOString`

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `bug`, `domain`, `value-object`
**Origem:** PR #148 review (Kody AI)

## Descrição
A função `Timestamp.toISOString` está implementada chamando `self.toISOString()`, com risco de recursão infinita e `stack overflow`.

## Comentários Relacionados (PR #148)
- `src/modules/social-care/domain/value-objects/timestamp.valueObject.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226075

## Tarefas
- [ ] Ajustar implementação para chamada explícita do método nativo (`Date.prototype.toISOString.call(self)`).
- [ ] Adicionar teste unitário cobrindo `Timestamp.toISOString`.
- [ ] Validar ausência de regressão nos usos de `Timestamp` no domínio.

## Critérios de Aceite
- [ ] `Timestamp.toISOString` retorna ISO válido sem recursão.
- [ ] Testes de `timestamp.valueObject` cobrindo o cenário passam.
