# @conecta/social/social-care

> Core domain do Conecta Social. Implementa o prontuário social (`Patient`) e os value objects que cercam atendimentos, encaminhamentos e relatos de violação.

## Superfície pública
- `value-objects/` — VO`s como `Diagnosis`, `HousingCondition`, `SocialHealthSummary`, `Timestamp`, `PersonId`, `SocialBenefitsCollection`, etc.
- `entities/` — `Patient` (agregado), `FamilyMember`, `Referral`, `RightsViolationReport`, `SocialCareAppointment`.
- `err/` — catálogos (`P`, `RE`, `RVR`, `SCAE`, `BE`, …) expostos via `shortcuts`.

Todos os módulos são reexportados por `packages/social/social-care/index.ts`, permitindo imports via `@conecta/social-care`.

## Agregado `Patient`
- **Criação**: `Patient.createFromScratch(personId, diagnoses)` valida `Uuid`, diagnóstico inicial e duplicidade usando `ImutableList.hasDuplicates()`.
- **Família**: `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` mantêm unicidade de `personId` e do cuidador principal; erros catalogados em `P.*`.
- **Encaminhamentos/violações**: `createReferral` e `reportRightsViolation` garantem que o alvo pertença ao agregado (`personId` do paciente ou membros) e delegam regras de datas aos VO`s `Timestamp`.
- **Narrativas clínicas**: `registerAppointment`, `updateHousingCondition`, `updateSocioEconomicSituation`, `updateCommunitySupportNetwork`, `updateSocialHealthSummary` aplicam `copyWith` imutável e preservam histórico (`ImutableListFactory.castTolist(...).add(...)`).

Use sempre os métodos do agregado; modificar coleções diretamente quebra invariantes de fronteira.

## Value Objects
- **Identidade**: `PersonId`, `FamilyMemberId`, `Uuid` (v7 por padrão).
- **Clínicos**: `Diagnosis` (depende de `ICDCode`), `SocialHealthSummary`, `CommunitySupportNetwork`, `SocioEconomicSituation`, `HousingCondition`, `SocialBenefit`/`SocialBenefitsCollection`.
- **Temporal**: `Timestamp` remove milissegundos e faz cópia defensiva ao criar/copyWith; expõe `Timestamp.now(clock)` para injetar `ClockProtocol` em testes ou integrações.

## Cookbook rápido (como usar)
- **Erros e Result**: retorne `Result<T, DomainError>`; converta erros via catálogos (`P`, `BE`, `SBC`, etc.) com `toHttp`/`toTelemetry`. Ex.: `return err(P.FamilyMemberAlreadyExists(...))`.
- **Option**: campos opcionais (`housingCondition` etc.) usam `Option` (`Some/None`) em vez de `undefined`; mutações passam por `copyWith`.
- **Coleções imutáveis**: crie com `ImutableListFactory.fromArray` e use `add/remove/setUnique`; para validar duplicados, `hasDuplicates()`/`findDuplicates()`.
- **Protocolos**: injete `ClockProtocol` em chamadas temporais (`Timestamp.now(clock)`) e `IdProviderProtocol` em geradores de ID (`PersonId.create(undefined, idProvider)`, `FamilyMemberId.create(undefined, idProvider)`). Adaptadores default vivem em `@conecta/adapters`; fakes podem ser usados em testes.
- **Pipelines com Result**: encadeie VO`s com `flatMap` ou guard clauses, mantendo pureza e retornando erros específicos.

### Protocolos injetáveis
- `ClockProtocol` e `IdProviderProtocol` vivem em `@conecta/protocols` com adaptadores padrão em `@conecta/adapters`.
- `PersonId.create`/`FamilyMemberId.create` aceitam `idProvider` opcional; `Timestamp.now` aceita `clock`.
- O agregado `Patient` gera IDs via `IdProviderProtocol` (default `uuidV7Provider`), preservando o modelo atual de VO/entidade.

Cada VO expõe `create` retornando `Result`. Ao combinar vários VO`s, use `flatMap` para manter o pipeline puro.

## Catálogos de erros
- `P` (`Patient.error.ts`) cobre invariantes do agregado.
- `RE`, `RVR`, `SCAE` tratam regras específicas de `Referral`, `RightsViolationReport` e `SocialCareAppointment`.
- `ICDError`, `BE`, `HC`, `SBC`, etc., seguem `makeDomainErrorFactory` do shared kernel. Todos expõem `toHttp`/`toTelemetry`.

## Testes
- `packages/social/social-care/tests/unit` — suites para VO`s e entidades (ver `patient.aggregate.spec.ts`, `housingCondition.valueObject.spec.ts`, etc.).
- `packages/social/social-care/tests/regression` — guarda bugs históricos; mantido vermelho somente enquanto houver correções pendentes.
- Comando recomendado: `bun test packages/social/social-care/tests`.

<Note>
  Sempre que novas operações do agregado surgirem (ex.: eventos publicados, integrações ACL), documente o contrato aqui antes de liberar o pacote.
</Note>

## Eventos e integrações planejadas (v0.1.0+)
- **EventBusProtocol**: publicar eventos de domínio (ex.: `PatientReferralCreated`, `SocialCareAppointmentRegistered`) via `@conecta/protocols`. Definir payloads/roteamento antes da primeira release.
- **NotifierProtocol**: opcional para avisos externos (e-mail/push) a partir de certas operações; pendente especificar gatilhos.
- **Clock/IdProvider**: já injetados em `Patient`, `Timestamp`, `PersonId`/`FamilyMemberId`; padronizar factories de use-case para receber dependências.
