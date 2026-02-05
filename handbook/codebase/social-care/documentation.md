# @conecta/social-care

> Core domain do Conecta Social. Implementa o prontuário social (`Patient`) e os value objects que cercam atendimentos, encaminhamentos e relatos de violação.
> Localização: `src/modules/social-care`

## Estrutura do Pacote
Seguindo a **Arquitetura Hexagonal** (Ports & Adapters), o módulo está dividido em:

- `domain/` — O coração do sistema. Contém Entidades, Value Objects, Erros e Eventos. Dependência zero de frameworks.
- `application/` — Casos de Uso, portas (interfaces de repositório) e DTOs. Orquestra o domínio.
- `interface/` — Implementações concretas (`PostgresPatientRepository`) e testes de integração.

## Domínio (`domain/`)

### Superfície pública
- `value-objects/` — VOs como `Diagnosis`, `HousingCondition`, `SocialHealthSummary`, `Timestamp`, `PersonId`, `SocialBenefitsCollection`, etc.
- `entities/` — `Patient` (agregado), `FamilyMember`, `Referral`, `RightsViolationReport`, `SocialCareAppointment`.
- `errors/` — catálogos (`P`, `RE`, `RVR`, `SCAE`, `BE`, …) expostos via `shortcuts`.
- `events/` — eventos de domínio como `PatientCreated`, `FamilyMemberAdded`, `ReferralCreated`, `RightsViolationReported`, `SocialCareAppointmentRegistered`.

### Agregado `Patient`
- **Criação**: `Patient.createFromScratch(personId, diagnoses)` valida `Uuid`, diagnóstico inicial e duplicidade.
- **Família**: `addFamilyMember`, `removeFamilyMember` e `assignPrimaryCaregiver` mantêm unicidade de `personId` e do cuidador principal.
- **Eventos**: Mutações geram eventos que podem ser coletados via `pullDomainEvents()`.

## Aplicação (`application/`)

### Use Cases
- `RegisterNewPatient` — Orquestra a criação de um novo prontuário.
- `AddFamilyMember` — Adiciona um membro à família.
- `AssignPrimaryCaregiver` — Define o cuidador principal.
- `RemoveFamilyMember` — Remove um membro da família.
- `UpdateHousingCondition` — Atualiza dados de moradia.
- `UpdateSocioEconomicSituation` — Atualiza renda e benefícios.
- `RegisterAppointment` — Registra um atendimento realizado.
- `CreateReferral` — Cria um encaminhamento.
- `ReportRightsViolation` — Relata uma violação de direitos.
- **Status atual:** Todos os Use Cases listados acima estão 100% implementados e cobertos por testes unitários.

### Portas (Ports)
- `PatientRepositoryPort` — contrato para persistência do agregado `Patient`.
- `SocialAssessmentMapper` (Funcional) — ACL para conversão de DTOs para VOs.

## Interface (Adapters)
- **Persistência**: `PostgresPatientRepository` implementando `PatientRepositoryPort` via `SqlPort`.
- **Database**: PostgreSQL 17 (Schema híbrido Relacional + JSONB).

## Cookbook rápido (como usar)
- **Mappers Funcionais**: Use `mapXToDomain(dto)` para garantir proteção contra dados externos corrompidos.
- **Erros e Result**: retorne `Result<T, DomainError>`; converta erros via catálogos (`P`, `BE`, etc.).
- **Option**: campos opcionais usam `Option` (`Some/None`).
- **Coleções imutáveis**: `ImutableList` para listas dentro do agregado.
- **Protocolos/Portas**: Injete dependências (`ClockPort`, `IdProviderPort`) nos métodos que precisam de side-effects.

## Testes
- `src/modules/social-care/domain/tests/unit` — Regras de negócio puras.
- `src/modules/social-care/application/tests/unit` — Casos de uso, orquestração e mappers (ACL).
- `src/modules/social-care/interface/tests/integration` — Testes de repositório com banco real.
- Comando recomendado: `bun test src/modules/social-care`.

<Note>
  Sempre que novas operações do agregado surgirem, atualize os eventos de domínio correspondentes.
</Note>
