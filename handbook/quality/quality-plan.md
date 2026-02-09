# Plano de Qualidade — 07/11/2025

## 1. Estado atual da suíte
- Comando executado: `bun test` (2026-02-06, ambiente local).
- Resultado: **verde** com skips planejados (integração Postgres depende de SC_DB_*; use case ReportRightsViolation ainda não implementado e está skipado).
- Evidência atual: saída local; atualizar relatório diário quando houver CI.

## 2. Riscos e lacunas identificados
1. **Cobertura parcial de erros nos VO`s financeiros**
   - `SocialBenefit.copyWith` lança `unwrap()` em caso de `FamilyMemberId` inválido, mas não há teste cobrindo o cenário (arquivo `src/modules/social-care/domain/value-objects/SocialBenefit.valueObject.ts`).
   - `SocialBenefitsCollection.create` aceita apenas arrays, porém não valida `null/undefined`; precisamos de regressão dedicada.
2. **Constantes inconsistentes**
   - `ELETRICITY_ACCESS` ainda lista valores de acesso à água (`WELL_SPRING`, `RAINWATER_HARVESTING`). Não há teste garantindo catálogo correto.
3. **Imports profundos/errados**
   - Dois VO`s importam `src` diretamente (`SocialBenefit.valueObject.ts`, `SocialBenefitsCollection.valueObject.ts`). Falhas de configuração podem passar despercebidas sem teste.

## 3. Roteiro imediato
1. **Infra CI**: configurar pipeline para rodar `bun test` com DB disponível ou manter skip condicional documentado; gerar junit/coverage.
2. **Backlog de regressões** (mantém-se):
   - Adicionar testes RED para `SocialBenefit.copyWith` e `SocialBenefitsCollection.create(null)`.
   - Garantir catálogo `ELETRICITY_ACCESS` consistente (teste em `housingCondition.props.spec.ts`).
3. **Documentação**: manter `handbook/architecture/command.md` sincronizado conforme novas migrações de Command Pattern.

## 4. Checklist antes de liberar nova versão
- [ ] `bun test` verde e registrado no relatório diário.
- [ ] Novos testes cobrindo bugs encontrados.
- [ ] Lint/Typecheck (`bun run lint`, `bun run typecheck` quando disponíveis).
- [ ] Handbook sincronizado (`handbook/codebase/**`, `process/retrocompatibilidade.md`).
- [ ] Changelog atualizado conforme `handbook/process/versioning.md`.

## 5. Atualizações (2026-02-06)
- Migrados inputs de domínio de social-care para Commands na porta de entrada da aplicação.
- Use cases do módulo social-care atualizados para receber Commands.
- Remoção de `src/modules/social-care/domain/inputs` após migração para `src/modules/social-care/application/ports/commands`.
- Adicionados adapters de Command para novos use cases em `src/modules/social-care/interface/adapter/commands`.
- Implementada limpeza explícita de eventos no AggregateRoot e teste de não-duplicidade no agregado Patient.
- Implementado Outbox Pattern (tabela, escrita transacional e worker) para eventos do agregado.
- Documentado Outbox Pattern em `handbook/architecture/outbox.md`.
- DTOs de interface desacoplados dos enums de domínio para avaliação social.
- Extraída camada de mappers de persistência do repositório Postgres, com testes unitários dedicados.
- Mappers de persistência agora retornam erro explícito com contexto em caso de corrupção de dados.
- Response mapper HTTP/gRPC adicionado em `src/shared/adapters/response.mapper.ts` com testes unitários.
