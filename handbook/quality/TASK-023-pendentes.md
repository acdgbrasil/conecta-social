# TASK-023 - Pendências pós-migração (2026-02-06)

- [ ] Implementar use case `report-rights-violation.use-case.ts` e reativar testes (`describe.skip` atual).
- [ ] Rodar integração Postgres quando `SC_DB_*` estiver disponível e remover skip condicional.
- [x] Migrar inputs de domínio para Commands na porta de entrada da aplicação (TASK-019 relacionado).
- [x] Ajustar adapters de command restantes para novos use cases quando forem expostos na camada de interface.
