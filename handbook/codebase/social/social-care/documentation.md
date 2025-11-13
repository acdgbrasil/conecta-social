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
- **Temporal**: `Timestamp` remove milissegundos e faz cópia defensiva ao criar/copyWith.

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
