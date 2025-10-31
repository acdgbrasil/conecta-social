Com certeza. Aqui está um documento de auditoria detalhado, em formato Markdown, que verifica todo o modelo de domínio que construímos para o **Conecta Social**.

Este documento serve como um *checklist* de verificação para garantir que nosso design está completo, coeso e alinhado aos princípios do Domain-Driven Design (DDD) e do Código Limpo, conforme nossas discussões e os materiais de referência.

---

# Documento de Auditoria de Design de Domínio: Conecta Social (v1.0)

## Registro complementar — 2024-12-29 (feature/1.5 cleanup)

| Item de Auditoria Incremental | Status | Evidências / Observações |
| :--- | :---: | :--- |
| Erros de domínio para `CommunitySupportNetwork` (`CSN-001`) definidos e referenciados pelo VO | `[X]` | `packages/social/social-care/err/CommunitySupportNetwork.error.ts`, testes em `communitySupportNetwork.valueObject.test.ts` cobrindo whitespace.
| Catálogo `HousingConditionErrors` com códigos `HC-001` a `HC-003` implantado e utilizado | `[X]` | `packages/social/social-care/err/HousingCondition.error.ts`, VO atualizado; testes existentes continuam válidos.
| Bun test runner em execução pós-ajustes | `[Δ]` | `bun test --test-name-pattern "CommunitySupportNetwork"` e `"HousingCondition"` aprovados. Geração de cobertura `lcov` falha no sandbox (somente leitura). Reexecutar com permissão de escrita em ambiente real para relatório completo.
| Cobertura mínima configurada (85%) | `[X]` | `bunfig.toml` agora força `coverage`, `lcov` e thresholds de linhas/funções/declarações.

> `[Δ]` indica pendência operacional externa (neste caso, bloquearam a escrita em `./coverage/`). O modelo de domínio permanece válido; apenas o relatório `lcov` precisa ser gerado em ambiente com permissão de escrita.


## 1. Introdução

### 1.1. Propósito da Auditoria

Esta auditoria tem como objetivo revisar e validar o design de domínio (Domain Model) proposto para o **Contexto de Atendimento Social** (`Social Care Context`) do sistema **Conecta Social**. A verificação assegura que o modelo:
1.  Atende aos requisitos de negócio estabelecidos (foco no paciente de doença rara, perspectiva do assistente social).
2.  Está alinhado com os princípios de **Design Estratégico e Tático** do Domain-Driven Design (DDD).
3.  Adere às filosofias de nomenclatura e design do **Código Limpo** (Clean Code), incluindo o uso de nomes em inglês que revelem a intenção.
4.  Captura com sucesso a complexidade inspirada pelos manuais do SUAS (Sistema Único de Assistência Social), mas a refatora em um modelo de domínio coeso e centrado no paciente.

### 1.2. Critérios de Verificação

Cada componente do domínio será avaliado com base em:
* **Completude:** Todos os atributos, regras de negócio e eventos discutidos foram definidos?
* **Coesão (DDD):** O componente (Agregado, VO, Entidade) tem uma responsabilidade única e clara?
* **Encapsulamento (DDD):** As regras de negócio (invariantes) estão protegidas dentro do objeto apropriado?
* **Clareza (Clean Code):** A nomenclatura é expressiva, inequívoca e segue o padrão (inglês) solicitado?

---

## 2. Auditoria Estratégica (Strategic Design)

Verifica a arquitetura de alto nível do domínio.

| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Definição de Bounded Contexts** | **`[X]` Aprovado** | O sistema foi corretamente dividido em Bounded Contexts claros. O `Social Care Context` (nosso Core Domain) está isolado do `Identity and Access Context` (Genérico) e do `Analysis and Research Context` (Futuro "Conecta Raros"). |
| **Linguagem Ubíqua (Ubiquitous Language)** | **`[X]` Aprovado** | Uma linguagem comum foi definida e aplicada consistentemente em todos os componentes do modelo (ex: `Patient`, `SocialHealthSummary`, `Referral`), garantindo que desenvolvedores e especialistas falem o mesmo idioma. |
| **Mapa de Contextos (Context Map)** | **`[X]` Aprovado** | As relações entre os contextos estão claras: `Identity` (Upstream) -> `Social Care` (Downstream). E `Social Care` (Upstream) -> `Analysis` (Downstream), indicando um fluxo claro de dados. |

---

## 3. Auditoria Tática: O Agregado `Patient` (Core Domain)

Verifica o design do agregado principal do nosso Bounded Context.

### 3.1. Verificação da Raiz do Agregado (Aggregate Root)

| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Identificação da Raiz** | **`[X]` Aprovado** | O `Patient` foi corretamente identificado como a Entidade Raiz. Isso cumpre o requisito de negócio de mudar o foco da `referencePerson` para o paciente. |
| **Consistência (Invariantes)** | **`[X]` Aprovado** | Definimos que a Raiz `Patient` é responsável por garantir todas as regras de negócio que cruzam objetos (ex: "só pode haver um `PrimaryCaregiver`"), através de seus métodos (`addFamilyMember`, `assignPrimaryCaregiver`, etc.). |
| **Identidade Global** | **`[X]` Aprovado** | O `Patient` possui um `id` (UUID) global e uma referência `personId` ao Contexto de Pessoas, garantindo unicidade e integração. |
| **Coesão do Agregado** | **`[X]` Aprovado** | O agregado foi mantido coeso. Decidimos ativamente *não* incluir dados detalhados (ex: escolaridade) dos membros da família, mas sim referenciá-los (`personId`), mantendo o agregado `Patient` focado em seu contexto imediato. |

### 3.2. Auditoria dos Value Objects (VOs) do Agregado `Patient`

Value Objects são definidos por seus atributos e devem ser imutáveis e autocontidos.

#### 3.2.1. VO: `Diagnosis`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Atributos** | **`[X]` Aprovado** | Definidos: `icdCode`, `date`, `description`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: `icdCode` não pode ser nulo/vazio; `date` não pode ser no futuro. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Nomes claros, em inglês. |

#### 3.2.2. VO: `SocialHealthSummary`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Atributos** | **`[X]` Aprovado** | Definidos: `requiresConstantCare`, `hasMobilityImpairment`, `functionalDependencies`, `hasRelevantDrugTherapy`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: Lista `functionalDependencies` deve ser de valores válidos e sem duplicatas; booleanos não podem ser nulos. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | `SocialHealthSummary` é um nome que revela muito melhor a intenção do que o antigo `familyHelphyCondition.ts`. |

#### 3.2.3. VO: `HousingCondition`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Atributos** | **`[X]` Aprovado** | Definidos: `propertyType`, `wallMaterial`, `numberOfRooms`, `numberOfBedrooms`, `electricityAccess`, `waterSupplySource`, `sewageDisposalMethod`, `wasteCollectionType`, `accessibilityLevel`, `isInGeographicRiskArea`, `isInSocialConflictArea`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: Validade de categorias (enums); `numberOfBedrooms` <= `numberOfRooms`; booleanos de risco não nulos. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Captura o domínio de `homeConditions.ts` de forma clara e estruturada. |

#### 3.2.4. VO: `SocioeconomicSituation` (e `SocialBenefit`)
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Atributos** | **`[X]` Aprovado** | Definidos: `totalFamilyIncome`, `incomePerCapita`, `receivesSocialBenefits`, `socialBenefits` (lista de `SocialBenefit`), `mainSourceOfIncome`, `hasUnemployedMembers`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: Rendas >= 0; consistência da lista de benefícios (se `receivesSocialBenefits`=true, lista não vazia); `mainSourceOfIncome` obrigatório se renda > 0. |
| **Escopo** | **`[X]` Aprovado** | Verificado que este VO reflete a situação da **família** (núcleo doméstico), e não do paciente isolado, o que está correto para o domínio. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Consolida e substitui `workCondition.ts` e `familyEnvetlyBenefits.ts`. |

#### 3.2.5. VO: `CommunitySupportNetwork`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Atributos** | **`[X]` Aprovado** | Definidos: `hasSupportFromRelatives`, `hasSupportFromNeighbors`, `familyConflictLevel`, `patientParticipatesInGroups`, `familyParticipatesInGroups`, `patientHasAccessToLeisure`, `facesDiscriminationInCommunity`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: Booleanos não nulos; `familyConflictLevel` deve ser de um conjunto predefinido (enum). |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Substitui `familyComunitaryConvivation.ts` com maior clareza. |

### 3.3. Auditoria das Entidades Internas (Entities) do Agregado `Patient`

Entidades são definidas por sua identidade (`id`) e ciclo de vida.

#### 3.3.1. Entidade: `FamilyMember`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Identidade** | **`[X]` Aprovado** | Definida: `id` (UUID local) e `personId` (referência global). Uso de UUIDs recomendado para evitar ambiguidade. |
| **Atributos** | **`[X]` Aprovado** | Definidos: `relationship`, `isPrimaryCaregiver`, `residesWithPatient`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: `personId` e `relationship` obrigatórios e válidos; **Unicidade do `isPrimaryCaregiver`** (regra crucial garantida pela Raiz `Patient`). |
| **Eventos de Domínio** | **`[X]` Aprovado** | Definidos: `FamilyMemberAdded`, `FamilyMemberRemoved`, `PrimaryCaregiverAssigned`, `FamilyMemberResidenceChanged`. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Substitui `familyComposition.ts` com foco claro na relação com o paciente. |

#### 3.3.2. Entidade: `SocialCareAppointment`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Identidade** | **`[X]` Aprovado** | Definida: `id` (UUID). |
| **Atributos** | **`[X]` Aprovado** | Definidos: `date`, `professionalInChargeId`, `type`, `summary`, `actionPlan`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: `date` não futura; `professionalInChargeId` válido; `type` válido (enum); `summary` ou `actionPlan` obrigatórios. |
| **Eventos de Domínio** | **`[X]` Aprovado** | Definido: `SocialCareAppointmentRegistered`. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Nome com forte intenção, captura a ideia de "Registro Simplificado de Atendimentos" e `firstEntryInUnity.ts`. |

#### 3.3.3. Entidade: `Referral`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Identidade** | **`[X]` Aprovado** | Definida: `id` (UUID). |
| **Atributos** | **`[X]` Aprovado** | Definidos: `date`, `requestingProfessionalId`, `referredPersonId`, `destinationService`, `reason`, `status`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: `date` não futura; `referredPersonId` válido (do agregado); `destinationService` e `reason` obrigatórios (de lista válida); `status` inicial `PENDING` e transições de status lógicas. |
| **Eventos de Domínio** | **`[X]` Aprovado** | Definidos: `ReferralCreated`, `ReferralStatusUpdated`. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Captura o "Formulário de controle dos encaminhamentos". |

#### 3.3.4. Entidade: `RightsViolationReport`
| Item de Auditoria | Status | Observações |
| :--- | :---: | :--- |
| **Identidade** | **`[X]` Aprovado** | Definida: `id` (UUID). |
| **Atributos** | **`[X]` Aprovado** | Definidos: `reportDate`, `incidentDate`, `victimId`, `violationType`, `descriptionOfFact`, `actionsTaken`. |
| **Regras de Negócio** | **`[X]` Aprovado** | Definidas: Datas consistentes; `victimId` válido; `violationType` obrigatório (de lista válida); `descriptionOfFact` obrigatória; `actionsTaken` obrigatórias para certos tipos de violação. |
| **Eventos de Domínio** | **`[X]` Aprovado** | Definidos: `RightsViolationReported`, `RightsViolationActionsUpdated`. |
| **Nomenclatura (Clean Code)** | **`[X]` Aprovado** | Substitui `familySituationViolation.ts` com um nome mais preciso e profissional. |

---

## 4. Conclusão da Auditoria

**Status Geral: `APROVADO`**

O design de domínio proposto para o `Social Care Context` (Conecta Social) está **completo** e **coeso**.

* **Atendimento aos Requisitos:** O modelo é centrado no `Paciente` e captura com sucesso todos os aspectos contextuais (família, moradia, renda, saúde, rede de apoio) e dinâmicos (atendimentos, encaminhamentos, violações) inspirados nos manuais do SUAS e no código-fonte original.
* **Aderência ao DDD:** O design demonstra uma aplicação clara dos padrões táticos (Agregado, Entidade, VO) e estratégicos (Bounded Context, Linguagem Ubíqua). A decisão de separar o `personId` (referência global) do `FamilyMember` (entidade local) é um exemplo de bom design de agregado.
* **Aderência ao Clean Code:** A nomenclatura em inglês é padronizada, revela a intenção e faz distinções claras, conforme solicitado.

O modelo está robusto e pronto para servir como base para a implementação da versão 1.5.
