# @conecta/conecta-raros/social-care

> Core domain do Conecta Social. Implementa o prontuário social (`Patient`) e os value objects que cercam atendimentos, encaminhamentos e relatos de violação.

## Estrutura do Pacote
Seguindo a **Arquitetura Hexagonal**, o pacote está dividido em:

- `domain/` — O coração do sistema. Contém Entidades, Value Objects, Erros e Eventos. Dependência zero de frameworks.
- `application/` — Casos de Uso, portas (interfaces de repositório) e DTOs. Orquestra o domínio.
- `infrastructure/` — Implementações concretas (SQLite, HTTP, etc.).

## Domínio (`domain/`)

### Superfície pública
- `value-objects/` — VOs como `Diagnosis`, `HousingCondition`, `SocialHealthSummary`, `Timestamp`, `PersonId`, `SocialBenefitsCollection`, etc.
- `entities/` — `Patient` (agregado), `FamilyMember`, `Referral`, `RightsViolationReport`, `SocialCareAppointment`.
- `errors/` — catálogos (`P`, `RE`, `RVR`, `SCAE`, `BE`, …) expostos via `shortcuts`.
- `events/` — eventos de domínio como `PatientCreated`, `FamilyMemberAdded`.

### Agregado `Patient`
- **Criação**: `Patient.createFromScratch(personId, diagnoses)` valida `Uuid`, diagnóstico inicial e duplicidade.
- **Família**: `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` mantêm unicidade de `personId` e do cuidador principal.
- **Eventos**: Mutações geram eventos que podem ser coletados via `pullDomainEvents()`.

## Aplicação (`application/`)

### Use Cases
- `RegisterNewPatient` — Orquestra a criação de um novo prontuário, garantindo unicidade de `PersonId` no repositório.
- *(Em desenvolvimento)*: `AddFamilyMember`, `CreateReferral`.

### Portas
- `PatientRepositoryProtocol` — contrato para persistência do agregado `Patient`.

## Cookbook rápido (como usar)
- **Erros e Result**: retorne `Result<T, DomainError>`; converta erros via catálogos (`P`, `BE`, etc.).
- **Option**: campos opcionais usam `Option` (`Some/None`).
- **Coleções imutáveis**: `ImutableList` para listas dentro do agregado.
- **Protocolos**: Injete dependências (`ClockProtocol`, `IdProviderProtocol`) nos métodos que precisam de side-effects.

## Testes
- `packages/conecta-raros/social-care/domain/tests/unit` — Regras de negócio puras.
- `packages/conecta-raros/social-care/application/tests/unit` — Casos de uso e orquestração.
- Comando recomendado: `bun test packages/conecta-raros/social-care`.

<Note>
  Sempre que novas operações do agregado surgirem, atualize os eventos de domínio correspondentes.
</Note>