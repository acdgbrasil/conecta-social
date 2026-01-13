Seguindo nossa numeração, este documento será o **`09_Integration_Testing_BDD.md`**.

Aqui, o foco **não** é testar se um método `sort()` funciona (isso é unitário), mas sim testar se **"Quando o Paciente faz Check-in, ele realmente aparece na lista de espera do banco de dados"**.

-----

# 🥒 09\_Integration\_Testing\_BDD.md

> **Propósito:** Definir cenários de teste de integração usando a sintaxe Gherkin (Given/When/Then).
> **Instrução para QA:** Estes testes validam a camada `Application` interagindo com o `Core` e uma implementação de persistência (seja `InMemory` ou `SQLite`). Eles garantem que os fluxos de negócio completos funcionam.

-----

## 1\. Estrutura do Teste de Integração

Diferente do Unitário (que usa Mocks falsos), o Teste de Integração usa:

1.  **Service Real** (`CheckInService`).
2.  **Core Real** (`DailyVisit`).
3.  **Repositório Funcional** (Geralmente um `InMemoryRepository` singleton ou um banco de dados de teste em container).

-----

## 2\. Feature: Check-in e Recepção

**Arquivo:** `Tests/IntegrationTests/Features/CheckIn.feature`

```gherkin
Feature: Check-in de Pacientes
  Como recepcionista
  Quero registrar a chegada de pacientes
  Para que eles possam iniciar a jornada de atendimento

  Scenario: Paciente chega pela primeira vez no dia
    Given que a unidade está aberta
    And que o paciente "João Silva" (ID: "P-123") ainda não tem visita hoje
    When a recepcionista realiza o check-in do "P-123"
    Then uma nova "Visita do Dia" deve ser criada com status "WaitingService"
    And o evento "PatientArrived" deve ser disparado

  Scenario: Tentativa de duplo check-in (Idempotência)
    Given que o paciente "Maria" (ID: "P-456") já fez check-in às 08:00
    When a recepcionista tenta fazer check-in de "P-456" novamente às 08:10
    Then o sistema deve retornar a Visita já existente
    And nenhuma nova visita deve ser duplicada no banco de dados
```

-----

## 3\. Feature: Triagem e Geração de Filas

**Arquivo:** `Tests/IntegrationTests/Features/Triagem.feature`

```gherkin
Feature: Triagem e Distribuição de Senhas
  Como enfermeiro de triagem
  Quero definir quais especialidades o paciente precisa
  Para que ele entre nas filas corretas com a prioridade adequada

  Scenario: Triagem com Prioridade Legal
    Given que o paciente "Sr. Osvaldo" (65 anos) está aguardando triagem
    When o enfermeiro define o roteiro:
      | Especialidade | Prioridade |
      | FISIO         | PRIORITY   |
      | NUTRI         | NORMAL     |
    Then uma Ordem de Serviço deve ser criada na fila de "FISIO" na posição 1 (Topo)
    And uma Ordem de Serviço deve ser criada na fila de "NUTRI" na posição final
    And o status da visita deve mudar para "WaitingService"

  Scenario: Bloqueio de Especialidade Inexistente
    Given que o paciente "Ana" está na triagem
    When o enfermeiro tenta enviar para especialidade "AEROESPACIAL"
    Then o sistema deve lançar um erro de "Especialidade Inválida"
    And nenhuma ordem deve ser gerada
```

-----

## 4\. Feature: Orquestração de Fila (Pull)

**Arquivo:** `Tests/IntegrationTests/Features/ChamarPaciente.feature`

```gherkin
Feature: Chamar Próximo Paciente
  Como especialista
  Quero chamar o próximo da fila
  Para realizar o atendimento

  Background:
    Given que a fila de "FISIO" possui os seguintes pacientes:
      | Paciente | Hora Chegada | Prioridade |
      | Pedro    | 08:00        | NORMAL     |
      | Joana    | 08:05        | PRIORITY   |
      | Carlos   | 08:10        | NORMAL     |

  Scenario: Respeito à Prioridade (Fura-Fila)
    When o Fisioterapeuta solicita o próximo paciente
    Then o sistema deve retornar "Joana" (Prioridade)
    And a ordem de "Joana" deve mudar status para "InProgress"
    And "Pedro" deve continuar aguardando na primeira posição dos normais

  Scenario: Paciente já em atendimento em outra sala
    Given que "Joana" já foi chamada pela "NUTRI" (está em outra sala)
    When o Fisioterapeuta solicita o próximo paciente
    Then o sistema deve pular "Joana" (bloqueada)
    And deve retornar "Pedro" (o próximo disponível)
```

-----

## 5\. Exemplo de Implementação (Swift XCTest)

Como implementar o cenário "Check-in" em código real usando `XCTest` para rodar no seu CI.

```swift
import XCTest
@testable import Application
@testable import Core

// Teste de Integração: Testa o fluxo Service -> Repo -> Core
final class CheckInIntegrationTests: XCTestCase {
    
    var service: CheckInService!
    var repo: InMemoryVisitRepository! // Um repositório em memória, mas funcional
    
    override func setUp() {
        // 1. Setup do Ambiente (GIVEN)
        self.repo = InMemoryVisitRepository()
        self.service = CheckInService(repository: repo)
    }
    
    func test_Scenario_FirstTimeCheckIn() async throws {
        // GIVEN (Contexto)
        let patientID = "P-123"
        
        // WHEN (Ação)
        let visit = try await service.execute(input: .init(patientID: patientID))
        
        // THEN (Validação de Persistência e Retorno)
        XCTAssertNotNil(visit.id)
        XCTAssertEqual(visit.status, .waitingService)
        
        // Verify Side Effects (Integração)
        let savedVisit = await repo.get(by: visit.id)
        XCTAssertEqual(savedVisit?.patientID.rawValue, "P-123", "O dado deve ter sido persistido no banco")
    }
}
```

### Dica de Ouro para seu QA:

Peça para ele focar nos **"Caminhos Infelizes"** (Edge Cases) nos testes de integração:

1.  O que acontece se tentar gerar ordem para uma fila que não existe?
2.  O que acontece se chamar um paciente que já foi embora?
3.  O que acontece na virada do dia (23:59 -\> 00:00)?

Esses BDDs cobrem a espinha dorsal do seu sistema.