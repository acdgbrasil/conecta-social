Aqui está o documento consolidado **`04_Domain_Specifications.md`**.

Este arquivo serve como a **"Bíblia do Domínio"**. Ele é denso em informação técnica, mas formatado para leitura rápida. Define a estrutura exata dos dados e os comportamentos obrigatórios que o código deve implementar.

-----

# 📘 04\_Domain\_Specifications.md

> **Propósito:** Especificação Técnica Detalhada das Entidades, Value Objects, Agregados e DTOs. Define a estrutura de dados e os contratos de comportamento do sistema.
> **Instrução para IA:** Use este arquivo para validar se as Entidades implementam os protocolos corretos (`Behavior`) e possuem os campos obrigatórios. Verifique se a mutabilidade ocorre apenas via métodos `mutating` definidos nos protocolos.

-----

## 1\. Princípios de Modelagem

1.  **Imutabilidade:** Todas as definições abaixo devem ser implementadas como `struct`.
2.  **Identidade:** Entidades devem conformar a `IdentifiableEntity` e usar `TaggedID` para segurança de tipo.
3.  **Comportamento:** A lógica de mudança de estado deve estar encapsulada em métodos `mutating` do protocolo, nunca exposta como propriedades `var` públicas (use `private(set)`).

-----

## 2\. Core Domain: Agregados & Entidades

### 🏥 2.1. Visita do Dia (`DailyVisit`)

*Raiz de Agregado. Representa o ciclo de vida do paciente na unidade em um dia específico.*

  * **Camada:** `Core`
  * **Protocolo:** `DailyVisitBehavior`

**Estrutura de Dados:**

| Propriedade | Tipo Swift | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Identificador único da visita. |
| `patientID` | `PatientID` | ID do Paciente (TaggedID). |
| `date` | `Date` | Data da visita (ignorar hora). |
| `status` | `DailyVisitStatus` | Estado atual (Enum). |
| `orders` | `[ServiceOrderID]` | Lista de OSs vinculadas. |
| `flags` | `VisitFlags` | Metadata (ex: `hasCarryOver`, `isPriority`). |

**Comportamentos Obrigatórios (Protocolo):**

  * `mutating func checkIn(at timestamp: Date)`: Transição para `.waitingService`.
  * `mutating func addOrder(_ orderID: ServiceOrderID)`: Vincula nova OS.
  * `mutating func closeDay(pendingOrders: Bool)`: Finaliza e define flag de CarryOver.

-----

### 📋 2.2. Ordem de Serviço (`ServiceOrder`)

*Unidade atômica de trabalho. Uma solicitação de serviço para uma especialidade.*

  * **Camada:** `Core`
  * **Protocolo:** `ServiceOrderBehavior`

**Estrutura de Dados:**

| Propriedade | Tipo Swift | Descrição |
| :--- | :--- | :--- |
| `id` | `ServiceOrderID` | ID único da OS. |
| `visitID` | `UUID` | Link para a Visita pai. |
| `specialtyID` | `SpecialtyID` | Especialidade solicitada (ex: "FISIO"). |
| `priority` | `OrderPriority` | Peso na fila (Normal, Prioridade, Max). |
| `status` | `ServiceOrderStatus` | Ciclo de vida (Pending...Finished). |
| `arrivalTimestamp` | `Date` | Data de entrada (para desempate FIFO). |
| `proof` | `AttendanceProof?` | Evidência do atendimento (apenas se concluído). |

**Comportamentos Obrigatórios (Protocolo):**

  * `mutating func startAttendance(at timestamp: Date)`: Muda status para `.inProgress`.
  * `mutating func finish(with proof: AttendanceProof)`: Valida prova e muda para `.finished`.
  * `mutating func promoteToCarryOver()`: Eleva prioridade para `.carryOverMax`.

-----

### 🔢 2.3. Fila de Especialidade (`SpecialtyQueue`)

*Gerenciador de lista ordenada. Aplica regras de prioridade e FIFO.*

  * **Camada:** `Core`
  * **Protocolo:** `QueueBehavior`

**Estrutura de Dados:**

| Propriedade | Tipo Swift | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | ID da fila (Singleton por especialidade). |
| `specialtyID` | `SpecialtyID` | Especialidade dona da fila. |
| `entries` | `[QueueEntry]` | Heap/Array ordenado de OSs. |
| `window` | `OperationWindow` | Regra de horário de funcionamento. |

**Comportamentos Obrigatórios (Protocolo):**

  * `mutating func enqueue(_ entry: QueueEntry)`: Insere e reordena (Sort).
  * `mutating func pullNext(excluding: [PatientID]) -> QueueEntry?`: Retorna o próximo elegível (pula pacientes ocupados).
  * `func estimatedWaitTime(for orderID: ServiceOrderID) -> TimeInterval`: Cálculo de previsão.

-----

## 3\. Shared Kernel: Value Objects & Tipos

### 🏷️ Identificadores Fortes (TaggedID)

Use `TaggedID<Tag>` para evitar confusão de Strings (Primitive Obsession).

  * `typealias PatientID = TaggedID<PatientTag>`
  * `typealias ProfessionalID = TaggedID<ProfessionalTag>`
  * `typealias ServiceOrderID = TaggedID<ServiceOrderTag>`
  * `typealias SpecialtyID = TaggedID<SpecialtyTag>`

### 🚦 Enums de Estado (State Machines)

**`ServiceOrderStatus`**

1.  `.pending` (Fila)
2.  `.ready` (Triado)
3.  `.inProgress` (Em sala)
4.  `.finished` (Concluído)
5.  `.canceled` (Desistência)
6.  `.absent` (Chamou e não veio)

**`OrderPriority`** (Int RawValue para ordenação)

  * `.normal` (1)
  * `.priority` (2 - Idosos, PCD)
  * `.carryOverMax` (99 - Veio de ontem)

### 📄 Comprovação (`AttendanceProof`)

  * **Camada:** `Core`
  * **Regra:** Value Object imutável. Não pode existir sem `resourceKey`.
  * **Campos:** `resourceKey` (String/URL), `timestamp` (Date), `professionalID` (ProfessionalID).

### ⏰ Janela de Operação (`OperationWindow`)

  * **Camada:** `Core`
  * **Regra:** Define se a criação de OS é permitida.
  * **Campos:** `openTime` (Hour/Min), `closeTime` (Hour/Min), `allowedDays` (Set\<Int\>).

-----

## 4\. Domain Events (Notificações)

Eventos são `structs` disparadas após mutações de sucesso.

| Evento | Payload Obrigatório | Gatilho |
| :--- | :--- | :--- |
| `PatientArrived` | `visitID`, `patientID`, `timestamp` | Check-in na recepção. |
| `TriageConcluded` | `visitID`, `plan: [SpecialtyID]` | Triagem define roteiro. |
| `ServiceOrderCreated` | `orderID`, `visitID`, `specialtyID`, `priority` | Nova OS entra na fila. |
| `AttendanceStarted` | `orderID`, `professionalID`, `roomID` | Profissional chama (Pull). |
| `AttendanceConcluded` | `orderID`, `timestamp` | Atendimento finalizado. |
| `DayClosed` | `date`, `totalVisits`, `carryOverCount` | Job noturno de fechamento. |

-----

## 5\. Application Contracts (DTOs)

A camada `Application` deve usar estes DTOs para entrada e saída, desacoplando o Core do gRPC.

**Inputs (Requests):**

  * `CheckInInput`: `{ patientID: String }`
  * `GenerateOrdersInput`: `{ visitID: String, specialties: [String], priorities: [String:Int]? }`
  * `CallNextInput`: `{ professionalID: String, specialtyID: String, roomID: String }`
  * `SubmitProofInput`: `{ orderID: String, professionalID: String, documentKey: String }`

**Outputs (Responses):**

  * `QueueStatusDTO`: `{ specialtyID: String, countWaiting: Int, nextEstimatedCall: Date? }`
  * `DailyVisitSummaryDTO`: `{ visitID: String, status: String, orders: [ServiceOrderSummaryDTO] }`