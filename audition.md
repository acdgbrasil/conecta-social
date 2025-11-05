# Auditoria de Domínio — Social Care

## Superfície pública
- [x] `@conecta/shared` expõe apenas Value Objects e utilidades estáveis.
- [x] `@conecta/social-care` centraliza entidades, VOs e catálogos de erro do contexto.
- [ ] Eventos de domínio publicados (`PatientCreated`, `ReferralRegistered`) estão documentados e versionados.

## Invariantes do agregado `Patient`
- [x] Diagnósticos iniciais obrigatórios (`PAT-001`).
- [x] Apenas membros cadastrados podem originar encaminhamentos e denúncias (`PAT-003`/`PAT-004`).
- [x] Atualizações preservam imutabilidade (`copyWith` sempre retorna nova instância).
- [x] Histórico de atendimentos é append-only com ordem cronológica preservada.

## Value Objects
- [x] `Diagnosis` depende de `Timestamp` e referencia `ICDCode`.
- [x] `FamilyMemberId` garante UUID v7 válido.
- [x] `SocialBenefitsCollection` mantém regras de agregação/deduplicação.
- [x] `Timestamp` devolve cópias defensivas e nunca expõe `Date` mutável.

## Catálogos de erro
- [x] `packages/social/social-care/err/*.ts` seguem padrão de fábrica `() => DomainError`.
- [x] Cada erro possui código (`PAT-xxx`, `RVR-xxx`, etc.) e mensagem orientada a domínio.

## Testes
- [x] Suites unitárias cobrem criação e invariantes das entidades centrais.
- [x] Testes de regressão capturam falhas conhecidas (ex.: `Timestamp` mutável).
- [x] `bun test --coverage` mantém métricas acima do threshold de 85%.
- [ ] Novos comportamentos sempre adicionam teste específico antes da implementação (TDD).

> Atualize esta auditoria a cada refatoração relevante no contexto Social Care.
