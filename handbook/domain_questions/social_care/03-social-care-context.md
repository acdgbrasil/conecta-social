# 📦 3. Social Care Context (Core Domain)

> *Responsável pela modelagem rica da realidade social do paciente raro, garantindo integridade, rastreabilidade e visão sistêmica da família.*

---

## 1. Agregado Raiz: `Patient`

O coração do sistema. Representa o paciente e todo o seu contexto social. É a única porta de entrada para alterar o estado do prontuário.

```ts
Patient {
  id: Uuid
  personId: PersonId
  diagnoses: ImutableList<Diagnosis>
  familyMembers: ImutableList<FamilyMember>
  appointments: ImutableList<SocialCareAppointment>
  referrals: ImutableList<Referral>
  violationsReports: ImutableList<RightsViolationReport>
  
  // Avaliações (Value Objects Substituíveis)
  housingCondition: Option<HousingCondition>
  socioeconomicSituation: Option<SocioEconomicSituation>
  communitySupportNetwork: Option<CommunitySupportNetwork>
  socialHealthSummary: Option<SocialHealthSummary>
}
```

### 1.1 Invariantes e Regras de Negócio (Implementadas)

| # | Regra | Descrição | Código de Erro (Ref) |
|---|---|---|---|
| **R1** | **Diagnóstico Obrigatório** | Paciente não nasce sem ao menos um CID inicial validado. | `PAT-001` |
| **R2** | **Unicidade de Identidade** | O `PersonId` é a chave de unicidade. | `APP-003` (App Layer) |
| **R3** | **Unicidade de Membros** | Não pode adicionar o mesmo `PersonId` duas vezes na família. | `PAT-005` |
| **R4** | **Cuidador Único** | Apenas um membro da família pode ser `PrimaryCaregiver` por vez. O método `assignPrimaryCaregiver` garante a troca atômica. | `PAT-007`, `PAT-008` |
| **R5** | **Fronteira de Encaminhamento** | Só é possível criar `Referral` ou `RightsViolationReport` para pessoas que pertencem ao Agregado (Paciente ou Família). | `PAT-003`, `PAT-004` |
| **R6** | **Imutabilidade** | Todas as coleções (`ImutableList`) e Value Objects são imutáveis; alterações geram nova versão do Agregado. | - |

---

## 2. Entidades Satélites (Child Entities)

### `FamilyMember`
Membro do núcleo familiar.
- **Identidade**: Possui `FamilyMemberId` próprio (UUID v7).
- **Invariantes**: Deve ter `personId` e `relationship` válidos (`FM-001`, `FM-002`).
- **Estado**: Flags de `isPrimaryCaregiver` e `residesWithPatient`.

### `SocialCareAppointment` (Atendimento)
Registro de uma interação/sessão com a assistência social.
- **Padrão**: Append-Only (Histórico não se apaga).
- **Regras**: Data não pode ser futura (`SCA-001`), narrativa (`summary` + `actionPlan`) obrigatória (`SCA-002`).
- **Limites**: Resumo e plano de ação têm limites de caracteres para garantir concisão (`SCA-003`, `SCA-004`).

### `Referral` (Encaminhamento)
Encaminhamento para serviços externos (Saúde, Educação, Jurídico).
- **Máquina de Estado**: `PENDING` → `COMPLETED` ou `CANCELLED`.
- **Proteção**: Não pode transitar de concluído para cancelado (`REF-003`).

### `RightsViolationReport` (Violação de Direitos)
Registro sensível de violações (negligência, violência, etc.).
- **Regras Temporais**: Data do incidente (`incidentDate`) deve ser anterior ou igual à data do relato (`reportDate`) (`RVR-002`).

---

## 3. Value Objects (A Riqueza do Domínio)

O domínio evita tipos primitivos (`string`, `number`) para conceitos complexos.

### 3.1 `ICDCode` (CID-10)
- **Validação**: Regex rigorosa para formato CID-10 (ex: `A00.0` ou `A00`).
- **Normalização**: Garante caixa alta e pontuação correta.
- **Erros**: `ICD-001` (formato inválido), `ICD-002` (vazio).

### 3.2 `Timestamp`
- **Encapsulamento**: Wrapper sobre `Date`.
- **Segurança**: Garante imutabilidade via cópia defensiva (impede mutação externa do objeto `Date`).
- **Regras**: Não aceita datas inválidas (`NaN`).

### 3.3 `HousingCondition`
- **Consistência**: Número de banheiros não pode ser maior que o número de quartos (`HC-003`).
- **Valores Negativos**: Quartos e banheiros não podem ser negativos (`HC-001`, `HC-002`).
- **Catálogos**: Usa constantes estritas para `WALL_MATERIAL`, `WATER_SUPPLY`, `ELECTRICITY_ACCESS` (ex: `METERED_CONNECTION`).

### 3.4 `SocioEconomicSituation` & `SocialBenefitsCollection`
- **Consistência Cruzada**: 
  - Regra `SES-001`: Não pode dizer que não recebe benefício se a lista de benefícios contiver itens.
  - Regra `SES-006`: Renda per capita não pode ser maior que renda total.
- **Coleção Inteligente**: `SocialBenefitsCollection` impede benefícios duplicados (`COLLECTION-001`) e calcula totais (`getTotalAmount`).

### 3.5 `CommunitySupportNetwork` e `SocialHealthSummary`
- **Limpeza**: Remove dependências funcionais duplicadas (`SHS`).
- **Validação**: Impede campos de texto vazios ou somente espaços (`CSN-001`).

---

## 4. Comandos Principais (Agregado `Patient`)

Esses são os métodos públicos que orquestram as mudanças de estado:

- `createFromScratch(personId, diagnoses)`: Fábrica principal.
- `addFamilyMember(member)`: Adiciona membro, validando duplicidade.
- `assignPrimaryCaregiver(personId)`: Troca o cuidador, revogando o anterior.
- `registerAppointment(draft)`: Adiciona novo atendimento.
- `createReferral(draft)`: Cria encaminhamento validando fronteira.
- `reportRightsViolation(draft)`: Registra violação validando fronteira e datas.
- `updateHousingCondition(condition)`: Substitui o VO de moradia.
- `updateSocioEconomicSituation(situation)`: Substitui o VO socioeconômico.

---

## 5. Tratamento de Erros

O domínio utiliza um padrão robusto de `DomainError` catalogado:

- **Prefixos**: Cada módulo tem seu prefixo (`PAT`, `FM`, `ICD`, `SES`).
- **Taxonomia**: Erros categorizados (`DomainRuleViolation`, `Conflict`, `InfrastructureDependencyFailure`).
- **Observabilidade**: Erros carregam contexto (IDs, valores inválidos) para logs estruturados, com suporte a redação de dados sensíveis.
