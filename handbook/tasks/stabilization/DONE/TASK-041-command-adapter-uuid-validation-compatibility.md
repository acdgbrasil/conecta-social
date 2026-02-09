# [TASK-041] Hardening UUID v7 nos Command Adapters

**Status:** ✅ Done
**Prioridade:** 🔥 Alta
**Labels:** `validation`, `adapter`, `hardening`, `uuidv7`
**Origem:** PR #148 review (Kody AI) + Decisão de Produto (08/02/2026)

## Descrição
A revisão inicial apontou risco de quebra, mas como o projeto não possui dados em produção, foi decidido **endurecer** a validação para exigir estritamente o padrão **UUID v7** em todos os campos de identificação. Isso garante performance de indexação e ordem cronológica nativa.

## Tarefas
- [x] Reforçar validação em todos os Command Adapters para usar `z.uuidv7()`.
- [x] Verificar que todos os mocks em testes unitários seguem o padrão v7 (confirmado: `018f4a7a...` é v7 válido).
- [x] Garantir uso de `z.prettifyError` para mensagens de erro amigáveis em caso de falha de versão do UUID.
- [x] Validar suíte de testes da aplicação (28 testes verdes).

## Critérios de Aceite
- [x] Nenhum UUID v4 ou inválido entra no sistema via Command Adapters.
- [x] Todas as camadas (Interface, Application, Domain) operam sob a lei única do UUID v7.
- [x] Suíte de testes unitários passa 100%.
