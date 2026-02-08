# [TASK-041] Revisar Validação UUID e Tratamento de Erro nos Command Adapters

**Status:** 🔴 To Do
**Prioridade:** 🔥 Alta
**Labels:** `validation`, `adapter`, `compatibility`
**Origem:** PR #148 review (Kody AI)

## Descrição
A revisão apontou risco de quebra por validação excessivamente restritiva de UUID (v7 apenas) e por possível acoplamento a helpers específicos de versão do Zod.

## Comentários Relacionados (PR #148)
- `src/modules/social-care/interface/adapter/commands/create-referral.command.adapter.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226129
- `src/modules/social-care/interface/adapter/commands/register-new-patient.command.adapter.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226160
- `src/modules/social-care/interface/adapter/commands/update-socioeconomic-situation.command.adapter.ts`:
  - https://github.com/acdgbrasil/conecta-social/pull/148#discussion_r2777226202

## Tarefas
- [ ] Mapear campos que devem aceitar UUID genérico (`z.string().uuid()`) vs campos estritamente v7.
- [ ] Ajustar schemas para compatibilidade com IDs legados quando aplicável.
- [ ] Garantir fallback seguro para formatação de erro de validação sem exceção em runtime.
- [ ] Adicionar testes para entradas inválidas e para UUIDs v4/v7 em cenários de atualização.

## Critérios de Aceite
- [ ] Command adapters retornam `err(...)` para input inválido sem lançar exceção.
- [ ] Compatibilidade explícita com registros legados de UUID conforme regra definida.
