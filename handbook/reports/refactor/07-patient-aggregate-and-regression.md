# Pós-refatoração — Paciente como Agregado Vivo + Suite de Regressão

Este registro cobre a ativação do agregado `Patient` com regras de consistência explícitas e a criação de uma suite de regressão que formaliza os apontamentos do último code review.

## Commits analisados
- 25d8655 — Implementa os métodos `create`, `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` no agregado `Patient`, introduz o catálogo de erros `P.*` e expõe o agregado nos barrels de `social-care`.
- ba72722 — Reorganiza os testes de entidade, adiciona cenários de regressão para cada bug levantado no CR-143 e ajusta artefatos de cobertura do Bun.

## Diferenças principais em relação ao registro 06

- **1. Agregado `Patient` com regras completas**  
  - `Patient.createFromScratch` continua blindando diagnóstico inicial e duplicidade de `ImutableList`.  
  - Foram implementados `createReferral`, `reportRightsViolation`, `registerAppointment`, `updateHousingCondition` e helpers de timestamp, garantindo que nenhum comportamento dependa de mutações diretas das listas internas.  
  - `PatientProps` e `copyWith` seguem sendo a porta de atualização para coleções/VO`s, mantendo o agregado congelado externamente.

- **2. Catálogo de erros e entidades de apoio fortalecidos**  
  - `packages/social/social-care/err/Patient.error.ts` define o catálogo `P-00x`, permitindo short-hands consistentes em todo o domínio.  
  - `FamilyMember.entity` ganhou métodos `assignAsPrimaryCaregiver`/`revokePrimaryCaregiver`, além de expor `FamilyMemberProps` para construção segura nos testes e casos de uso.  
  - O barrel principal de `social-care` agora reexporta `value-objects`, `err` e `entities`, evitando `deep imports`.

- **3. Coleções imutáveis evoluídas**  
  - `ImutableList` passa a oferecer `contains`, `setUnique` e `castTolist`, simplificando operações internas do agregado (`add/remove` retornam sempre listas novas).  
  - `ImutableListFactory.fromArray` centraliza a criação defensiva de listas, usada pelos métodos do `Patient` para garantir imutabilidade.

- **4. Testes de unidade e regressão como documentação viva**  
- `Patient.entity.test.ts` foi reorganizado em seções (criação, família, cuidador, fronteira do agregado, avaliações, atendimentos), com helpers reutilizáveis e asserts das mensagens de erro `P-*`. (Hoje este conteúdo vive em `packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts`.)  
- `regration.entity.test.ts` registra os bugs do CR-143 (cópia defensiva de `Timestamp`, validação de `CommunitySupportNetwork`, `SocialBenefitsCollection.create(null)`, `copyWith` em `FamilyMemberId/SocialBenefit`, imports profundos) e garante que futuras refatorações não reintroduzam falhas. (Atualizado para `packages/social/social-care/tests/regression/patient.aggregate.regression.spec.ts`.)  
  - Os testes de `FamilyMember`, `Referral` e `RightsViolationReport` receberam pequenos ajustes para refletir os novos utilitários (`FamilyMemberProps`, `Uuid` helpers).

## Estado de testes
- `bun test` (07/11/2025) — suites de `shared` e `social-care` 100% verdes.  
- A pasta `tests/regression` agora registra apenas o catálogo de erros (`domain-errors.red.regression.spec.ts`). Os bugs críticos apontados no CR-143 foram cobertos por testes unitários e estão verdes após os ajustes em VO`s (`Timestamp`, `CommunitySupportNetwork`, etc.).

## Próximas ações sugeridas
- Reforçar testes de VO`s ainda frágeis (`SocialBenefit.copyWith`, `SocialBenefitsCollection.create(null)`, `housingCondition.props`).
- Remover imports profundos remanescentes (`from "src"`) e alinhar catálogos (`ELETRICITY_ACCESS`) ao domínio real.
- Documentar eventos e integrações planejadas do agregado antes da primeira release pública (`v0.1.0`) e incluir no handbook/process.
