# TASK-023 — Log de Migração FP (TypeScript)

_Data: 2026-02-06_

## Escopo
- Modernizar libs funcionais (@conecta/result, @conecta/option, @conecta/fn/ImutableList) conforme TASK-023 e refletir modelo funcional/pipeable em testes.

## Estado atual
- **Result**: unions + helpers funcionais; instâncias com métodos via prototype; namespace `Result` reexportado.
- **Option**: union + helpers; compat `Some/None/unSafe` mantida.
- **ImutableList**: `readonly T[]` + `ImutableListFactory` helpers; chamadas migradas em domínio/use cases/testes.
- **Testes**: `bun test` (2026-02-06) verde, com skips planejados:
  - Integração Postgres skipada se `SC_DB_*` ausente.
  - `report-rights-violation.use-case` skip enquanto não implementado.
  - Result unwrap/unwrapErr agora validam `Error` genérico.

## Próximas ações (ordem)
1) **Infra**: se/quando DB disponível, remover skip da integração e validar pipeline CI.
2) **Use case faltante**: implementar `report-rights-violation` e reativar testes.
3) **Backlog externo**: seguir TASK-019 (Command Pattern) para migrar inputs dos use cases (não iniciado aqui).
4) **Registro**: manter este log atualizado a cada mudança.

## Histórico de mudanças nesta tarefa
- Migrado Option/ImutableList para estilo funcional e atualizados testes correspondentes.
- Ajustado Result para modelo funcional + métodos compartilhados; testes de Result/Uuid alterados para helpers.
- Rodado `bun test` (2026-02-06) — falhas: import `Result` ausente, integração Postgres, use case não implementado.
