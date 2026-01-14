# 📋 Plano de Finalização da Aplicação — Social Care

**Objetivo:** Completar a camada de Aplicação (`Use Cases`, `DTOs`, `Ports`) do módulo Social Care, tornando todas as funcionalidades do Domínio acessíveis via contratos públicos.

**Status:** 🚧 Em Progresso
**Prioridade:** Alta (Bloqueante para integração ACDG)

---

## 🏗️ Fase 1: Fundação & Infraestrutura (Ports)

Esta fase habilita a recuperação de agregados existentes, pré-requisito para qualquer edição.

### [TASK-001] Expandir `PatientRepositoryProtocol`
- **Descrição:** O repositório atual só tem `save` e `exists`. Precisamos recuperar o paciente para editá-lo.
- **Contrato:** `findById(id: Uuid): Promise<Result<Patient, DomainError>>` e/ou `findByPersonId`.
- **Critérios de Aceite:**
  - Protocolo atualizado.
  - Implementação `SQLitePatientRepository` (Mock) atualizada com `SELECT` funcional.
  - Teste de unidade no repositório validando o `find`.

### [TASK-002] Padronizar DTOs de Entrada
- **Descrição:** Criar DTOs para os VOs complexos (`HousingConditionDTO`, `EconomicSituationDTO`) para reutilização nos Use Cases.
- **Local:** `application/dto/social-assessment.dto.ts`
- **Critérios de Aceite:**
  - Mappers de/para JSON puro.
  - Validação básica de tipos (Zod ou manual) antes de chamar o Domínio.

---

## 👨‍👩‍👧‍👦 Fase 2: Gestão Familiar (Use Cases)

Funcionalidades para compor o núcleo familiar e definir responsabilidades.

### [TASK-003] UseCase: `AddFamilyMember`
- **Descrição:** Adicionar um parente ao prontuário.
- **Entrada:** `patientId`, `memberPersonId`, `relationship`, `isResiding`.
- **Fluxo:** Carregar Paciente -> `patient.addFamilyMember()` -> Salvar -> Evento `FamilyMemberAdded`.
- **Testes:**
  - Sucesso: Membro adicionado.
  - Erro: Membro duplicado (`PAT-005`).
  - Erro: Paciente não encontrado.

### [TASK-004] UseCase: `AssignPrimaryCaregiver`
- **Descrição:** Definir quem é o cuidador principal (troca atômica).
- **Entrada:** `patientId`, `targetMemberId`.
- **Fluxo:** Carregar Paciente -> `patient.assignPrimaryCaregiver()` -> Salvar.
- **Testes:**
  - Sucesso: Flag trocada do anterior para o novo.
  - Erro: Membro não encontrado na família.

### [TASK-005] UseCase: `RemoveFamilyMember`
- **Descrição:** Remover um membro (ex: erro de cadastro ou saída).
- **Fluxo:** `patient.removeFamilyMember()`.

---

## 🏠 Fase 3: Avaliação Social (Contexto)

Atualização dos Value Objects que descrevem a vulnerabilidade.

### [TASK-006] UseCase: `UpdateHousingCondition`
- **Descrição:** Atualizar dados de moradia (quartos, saneamento, etc.).
- **Fluxo:** `patient.updateHousingCondition(HousingCondition.create(...))`.
- **Regras:** Substituição total do VO (Imutabilidade).

### [TASK-007] UseCase: `UpdateSocioEconomicSituation`
- **Descrição:** Atualizar renda e benefícios.
- **Fluxo:** `patient.updateSocioEconomicSituation(...)`.
- **Atenção:** Validar consistência entre renda e benefícios (`SES-001`).

---

## 🩺 Fase 4: Intervenções e Fluxo (Workflow)

O dia-a-dia do Assistente Social.

### [TASK-008] UseCase: `RegisterAppointment` (Evolução)
- **Descrição:** Registrar um atendimento realizado.
- **Entrada:** `summary`, `actionPlan`, `date`, `professionalId`.
- **Fluxo:** `patient.registerAppointment(...)`.
- **Evento:** `SocialCareAppointmentRegistered` (Novo).

### [TASK-009] UseCase: `CreateReferral` (Encaminhamento)
- **Descrição:** Encaminhar paciente para outra rede.
- **Fluxo:** `patient.createReferral(...)`.
- **Regras:** Validar se o alvo (`referredPersonId`) pertence à família.
- **Evento:** `ReferralCreated` (Novo).

### [TASK-010] UseCase: `ReportRightsViolation`
- **Descrição:** Relato sensível de violação.
- **Fluxo:** `patient.reportRightsViolation(...)`.
- **Evento:** `RightsViolationReported` (Novo).

---

## ✅ Definição de Pronto (DoD)

1.  Todos os Use Cases implementados em `application/use-cases/`.
2.  Testes unitários de aplicação (`application/tests/unit`) cobrindo cenários de sucesso e erro.
3.  Repositório em memória suportando todas as operações.
4.  Eventos de domínio publicados no `EventBus`.
