# Relatório Diário — 05/01/2026

## Visão geral
- Retomada do projeto após as férias. Foco total em habilitar **Eventos de Domínio** no agregado `Patient` e iniciar a **Camada de Aplicação**.
- O sistema agora suporta arquitetura orientada a protocolos (PoP) e está pronto para orquestração via UseCases.

## Entregas Técnicas
- **Eventos de Domínio:** Implementada a infraestrutura para emissão de eventos no agregado raiz `Patient`.
  - Criados eventos: `PatientCreatedEvent` e `FamilyMemberAddedEvent` seguindo o contrato `DomainEvent`.
  - Entidade `Patient` refatorada para acumular e expor eventos via `pullDomainEvents()`.
  - Testes de regressão (`patient.events-and-version.red.spec.ts`) agora estão **verdes**.
- **Início da Camada de Aplicação:**
  - Definida estrutura de pastas: `application/use-cases` e `application/repositories`.
  - Criado teste unitário para o primeiro Caso de Uso: `RegisterNewPatientUseCase` (TDD).
  - Identificada a necessidade de separar erros de domínio (`P.*`) de erros de aplicação (`APP.*`).

## Code Review & Qualidade
- **Patient.entity.ts:** Revisado e aprovado. A densidade do arquivo foi notada, com plano futuro de refatoração para "Smart Collections" ou Delegates para limpar o agregado raiz.
- **Testes:** Cobertura de eventos garantida. Teste do UseCase `RegisterNewPatient` criado e pronto para implementação.

## Próximos Passos
1. Implementar `RegisterNewPatientUseCase` para fazer o teste passar.
2. Implementar `AddFamilyMemberUseCase`.
3. Criar catálogo de erros de aplicação (`APP.*`).
4. Definir contrato `PatientRepositoryProtocol`.

## Status dos Testes
- `bun test`: **Verdes** (exceto o novo teste do UseCase que ainda não foi implementado, o que é esperado no ciclo TDD).
