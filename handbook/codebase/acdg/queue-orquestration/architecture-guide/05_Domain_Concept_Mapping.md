Aqui está o documento consolidado **`05_Domain_Concept_Mapping.md`**.

Este arquivo é a "Pedra de Roseta" do projeto. Ele traduz o "iniciês" (requisitos de negócio) para o "programês" (Estruturas Swift e Protocolos), garantindo que desenvolvedores e IAs falem a mesma língua.

***

# 🗺️ 05_Domain_Concept_Mapping.md

> **Propósito:** Tabela de Tradução entre Conceitos de Negócio (nos requisitos) e Artefatos de Código (Structs/Protocolos).
> **Instrução para IA:** Use este arquivo para entender qual Struct Swift corresponde a qual conceito de negócio. Se o requisito fala "Visita do Dia", você deve procurar por `DailyVisit` no código.

---

## 1. Entidades e Agregados (Core Domain)

*Os "Substantivos" do sistema. Representam estado e regras.*

| Conceito de Negócio | Camada | Protocolo (Comportamento) | Implementação (Struct) | Responsabilidade Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Visita do Dia** | `Core` | `DailyVisitBehavior` | `DailyVisit` | Raiz do Agregado. Gerencia o ciclo do paciente no dia (Check-in → Alta). |
| **Fila de Especialidade** | `Core` | `QueueBehavior` | `SpecialtyQueue` | Mantém a ordem de atendimento (FIFO + Prioridade). |
| **Ordem de Serviço (OS)** | `Core` | `ServiceOrderBehavior` | `ServiceOrder` | Unidade de trabalho. Representa 1 atendimento (ex: "Fisio"). |
| **Janela de Operação** | `Core` | `OperationWindowRule` | `OperationWindow` | Regra de Horário (08h-17h). Impede criação de OS fora do expediente. |
| **Prova de Atendimento** | `Core` | `ProofValidatable` | `AttendanceProof` | Evidência (foto/doc) necessária para concluir uma OS. |

---

## 2. Casos de Uso (Application Layer)

*Os "Verbos" do sistema. Ações disparadas por atores ou eventos.*

| Ação de Negócio | Camada | Input Port (Contrato) | Implementação (Service) | Dependências (Output Port) |
| :--- | :--- | :--- | :--- | :--- |
| **Fazer Check-in** | `App` | `CheckInUseCaseProtocol` | `CheckInService` | `DailyVisitRepository` |
| **Gerar Ordens (Triagem)**| `App` | `GenerateOrdersUseCaseProtocol` | `GenerateOrdersService` | `QueueRepository`, `VisitRepository` |
| **Chamar Próximo (Pull)** | `App` | `CallNextPatientUseCaseProtocol` | `CallNextPatientService` | `QueueRepository` (método `pullNext`) |
| **Encerrar Dia** | `App` | `CloseDayUseCaseProtocol` | `CloseDayService` | `DailyVisitRepository` (flag `carryOver`) |

---

## 3. Eventos de Domínio (Domain Events)

*Notificações de mudança de estado. Usados para logs, métricas e reações em cadeia.*

| Evento no Negócio | Struct Swift (Shared) | Quem Dispara? | Quem Escuta? |
| :--- | :--- | :--- | :--- |
| **Paciente Chegou** | `PatientArrivedEvent` | `CheckInService` | Triagem, Painel |
| **Triagem Concluída** | `TriageConcludedEvent` | *Externo* (Sistema Triagem) | **Application** (Gera OS) |
| **OS Criada** | `OrderCreatedEvent` | `GenerateOrdersService` | Painel de Senhas |
| **Atendimento Iniciado** | `AttendanceStartedEvent` | `CallNextService` | Painel de Sala |
| **Atendimento Concluído** | `AttendanceConcludedEvent` | `CompleteOrderService` | Faturamento, BI |
| **Dia Encerrado** | `DayClosedEvent` | *Job Scheduler* | **Application** (Processa CarryOver) |

---

## 4. Vocabulário e Tipos (Shared Kernel)

*Termos onipresentes e seus tipos no código.*

| Termo | Tipo Swift | Definição / Valores |
| :--- | :--- | :--- |
| **ID do Paciente** | `PatientID` | `TaggedID<PatientTag>` (String forte) |
| **ID da Especialidade** | `SpecialtyID` | `TaggedID<SpecialtyTag>` (Ex: "FISIO", "NUTRI") |
| **Status da OS** | `ServiceOrderStatus` | Enum: `.pending`, `.ready`, `.inProgress`, `.finished` |
| **Prioridade** | `OrderPriority` | Enum: `.normal (1)`, `.priority (2)`, `.carryOver (99)` |
| **Status da Visita** | `DailyVisitStatus` | Enum: `.checkIn`, `.waiting`, `.finished` |

---

## 5. Interface Externa (gRPC Adapters)

*Mapeamento de chamadas de rede para Casos de Uso.*

| RPC (.proto) | Request DTO (Proto) | Use Case Acionado (App) | Response DTO (Proto) |
| :--- | :--- | :--- | :--- |
| `CheckInPatient` | `CheckInRequest` | `CheckInUseCaseProtocol` | `CheckInResponse` |
| `SubmitTriage` | `TriageResultProto` | `GenerateOrdersUseCaseProtocol` | `OrderListResponse` |
| `CallNext` | `CallNextRequest` | `CallNextPatientUseCaseProtocol` | `ServiceOrderProto` |
| `CloseDay` | `Empty` | `CloseDayUseCaseProtocol` | `CloseDaySummary` |