# 📋 Plano de Finalização da Aplicação — Social Care

**Objetivo:** Completar a camada de Aplicação (`Use Cases`, `DTOs`, `Ports`) do módulo Social Care, tornando todas as funcionalidades do Domínio acessíveis via contratos públicos.

**Status:** ✅ Concluído
**Prioridade:** Alta (Bloqueante para integração ACDG)

---

## 🏗️ Fase 1: Fundação & Interface (Ports)

### [TASK-001] Expandir `PatientRepositoryProtocol` ✅
### [TASK-002] Padronizar DTOs de Entrada ✅

---

## 👨‍👩‍👧‍👦 Fase 2: Gestão Familiar (Use Cases)

### [TASK-003] UseCase: `AddFamilyMember` ✅
### [TASK-004] UseCase: `AssignPrimaryCaregiver` ✅
### [TASK-005] UseCase: `RemoveFamilyMember` ✅

---

## 🏠 Fase 3: Avaliação Social (Contexto)

### [TASK-006] UseCase: `UpdateHousingCondition` ✅
### [TASK-007] UseCase: `UpdateSocioEconomicSituation` ✅

---

## 🩺 Fase 4: Intervenções e Fluxo (Workflow)

### [TASK-008] UseCase: `RegisterAppointment` ✅
### [TASK-009] UseCase: `CreateReferral` ✅
### [TASK-010] UseCase: `ReportRightsViolation` ✅

---

## ✅ Definição de Pronto (DoD)

1.  [x] Todos os Use Cases implementados em `application/use-cases/`.
2.  [x] Testes unitários de aplicação (`application/tests/unit`) cobrindo cenários de sucesso e erro.
3.  [x] Repositório em memória suportando todas as operações.
4.  [x] Eventos de domínio publicados no `EventBus`.