# Pós-refatoração — Paciente como Agregado Vivo + Suite de Regressão

Este registro cobre a ativação do agregado `Patient` com regras de consistência explícitas e a criação de uma suite de regressão que formaliza os apontamentos do último code review.

## Commits analisados
- 25d8655 — Implementa os métodos `create`, `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` no agregado `Patient`, introduz o catálogo de erros `P.*` e expõe o agregado nos barrels de `social-care`.
- ba72722 — Reorganiza os testes de entidade, adiciona cenários de regressão para cada bug levantado no CR-143 e ajusta artefatos de cobertura do Bun.

## Diferenças principais em relação ao registro 06

- **1. Agregado `Patient` com regras explícitas**  
  - `Patient.create` agora valida a presença de `Uuid`, `PersonId` e ao menos um diagnóstico inicial antes de gerar o estado (`ok/err` via `Result`).  
  - Os métodos `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` tratam duplicidade, inexistência e unicidade do cuidador principal usando os novos erros `P.FamilyMember*`.  
  - `PatientProps` e o barrel `entities/index.ts` passaram a exportar tipos utilitários para os demais módulos consumirem a superfície do agregado sem imports profundos.

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
- `bun test packages/social/social-care/tests/unit/entities/patient.aggregate.spec.ts`  
  - Seções 1 a 3 (criação, membros, cuidador) estão verdes.  
  - Seções 4 a 6 falham legitimamente porque os métodos `createReferral`, `reportRightsViolation`, `updateHousingCondition` e `registerAppointment` ainda não existem na classe (`TypeError: ... is not a function`).  
- A suite de regressão (`regration.entity.test.ts`) permanece RED até que os bugs do CR sejam sanados (por exemplo, `Timestamp` ainda expõe referência mutável).

## Próximas ações sugeridas
- Implementar os métodos pendentes do agregado (`createReferral`, `reportRightsViolation`, `updateHousingCondition`, `registerAppointment`) e demais mutações do estado clínico, respeitando as mesmas garantias de imutabilidade.  
- Endereçar os bugs sinalizados nos testes de regressão: cópia defensiva em `Timestamp`, validação de whitespace em `CommunitySupportNetwork`, `Result.err` em `SocialBenefitsCollection.create(null)`, `copyWith` dos VOs lidando com entradas inválidas e remoção de imports profundos remanescentes.  
- Automatizar a limpeza de artefatos de cobertura (`coverage/*.tmp`) ou ajustar o fluxo local para não versioná-los, mantendo o repositório enxuto.
