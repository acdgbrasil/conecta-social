Seguindo a numeração e o padrão "A Lei" que definimos (especialmente o foco em Protocolos e Isolamento), o nome perfeito para dar sequência à sua documentação seria:

### 🧪 `08_Unit_Testing_Guidelines.md`

Esse nome mantém a consistência com os anteriores (`07_Performance...`) e deixa claro que o escopo é **Unitário** (rápido, isolado, sem I/O), separando-o de testes de integração ou end-to-end.

Se você quiser já criar esse arquivo para o seu QA, aqui está o conteúdo ideal para ele. Este guia ensina como testar uma arquitetura **Protocol-Oriented** (o que é diferente de testar OOP tradicional), focando em **Mocks manuais** (que são triviais em Swift com Protocolos) em vez de frameworks pesados de Mocking.

-----

# 🧪 08\_Unit\_Testing\_Guidelines.md

> **Propósito:** Definir a estratégia de Testes Unitários para a arquitetura Protocol-Oriented.
> **Instrução para QA:** Testes unitários devem rodar em milissegundos. Eles testam regras de negócio (`Core`) e orquestração (`Application`) de forma isolada. **Proibido I/O (Rede/Disco) nestes testes.**

-----

## 1\. Filosofia de Teste (POP)

Nesta arquitetura, testar é simples porque **tudo depende de Protocolos**.

1.  **Core (Regras):** Testamos a lógica interna das `structs` (Entidades). Como são puras, basta instanciar, executar e verificar (`Assert`).
2.  **Application (Orquestração):** Testamos se o Serviço chama os repositórios corretamente. Para isso, usamos **Mocks** que implementam os protocolos de dependência.
3.  **Zero Magic:** Não usamos frameworks complexos de Mocking (como Cuckoo ou Mockingbird). Criamos Mocks simples (Structs/Classes) que conformam aos protocolos.

-----

## 2\. Como Testar o Core (Domain Logic)

O Core não tem dependências externas, então os testes são diretos.

**Cenário:** Verificar se a `SpecialtyQueue` reordena a prioridade corretamente.

```swift
import XCTest
@testable import Core

final class SpecialtyQueueTests: XCTestCase {
    
    func testEnqueue_ShouldSortByPriority() {
        // 1. Arrange (Cenário)
        var queue = SpecialtyQueue(specialtyID: .init(rawValue: "FISIO"))
        let normalOrder = ServiceOrder(priority: .normal)
        let priorityOrder = ServiceOrder(priority: .priority)
        
        // 2. Act (Ação)
        queue.enqueue(normalOrder)
        queue.enqueue(priorityOrder) // Deve furar fila
        
        // 3. Assert (Validação)
        XCTAssertEqual(queue.entries.first?.id, priorityOrder.id, "Prioridade deve vir primeiro")
        XCTAssertEqual(queue.entries.last?.id, normalOrder.id)
    }
    
    func testDuplicateEntry_ShouldThrowError() {
        var queue = SpecialtyQueue(specialtyID: .init(rawValue: "TEST"))
        let order = ServiceOrder(priority: .normal)
        
        queue.enqueue(order)
        
        // Testando erro tipado (Swift 6)
        XCTAssertThrowsError(try queue.enqueue(order)) { error in
            XCTAssertEqual(error as? DomainError, .duplicateEntry)
        }
    }
}
```

-----

## 3\. Como Testar a Application (Services)

Aqui precisamos isolar o Banco de Dados. Criamos um **Mock** do Repositório.

**Passo A: Criar o Mock (No arquivo de Teste)**

```swift
// Mock simples que implementa o protocolo do repositório
class MockQueueRepository: QueueRepositoryProtocol {
    var saveCalled = false
    var lastSavedQueue: (any QueueBehavior)?
    
    func save(_ queue: any QueueBehavior) async throws {
        saveCalled = true
        lastSavedQueue = queue
    }
}
```

**Passo B: Testar o Serviço (Injeção de Dependência)**

```swift
import XCTest
@testable import Application
@testable import Core

final class CreateQueueServiceTests: XCTestCase {
    
    func testExecute_ShouldSaveQueueToRepository() async throws {
        // 1. Arrange
        let mockRepo = MockQueueRepository()
        let service = CreateQueueService(repository: mockRepo) // Injeção do Mock
        let input = CreateQueueInput(specialtyID: "NUTRI")
        
        // 2. Act
        try await service.execute(input: input)
        
        // 3. Assert
        XCTAssertTrue(mockRepo.saveCalled, "O repositório deveria ter sido chamado")
        XCTAssertEqual(mockRepo.lastSavedQueue?.specialtyID.rawValue, "NUTRI")
    }
}
```

-----

## 4\. O que NÃO testar (Unitariamente)

1.  **Integração com Banco:** Não teste se o `Postgres` está salvando. Isso é teste de Integração. O teste unitário confia que, se o método `save` do protocolo foi chamado, o trabalho do Serviço acabou.
2.  **Controllers gRPC:** O adaptador gRPC é apenas um tradutor ("burro"). Geralmente não precisa de teste unitário complexo, a menos que haja lógica de mapeamento complicada.
3.  **Frameworks:** Não teste se o `JSONDecoder` funciona (a Apple já testou isso). Teste se a sua struct decodifica corretamente.

-----

## 5\. Checklist para o QA

Ao revisar um PR de testes:

  * [ ] O teste roda em menos de 0.1s?
  * [ ] O teste cria algum arquivo ou faz requisição de rede? (Se sim, **Rejeite**).
  * [ ] O teste depende de ordem de execução? (Cada teste deve ser independente).
  * [ ] Os nomes dos testes explicam o cenário? (Ex: `test_CheckIn_WhenPatientBanned_ShouldThrowError`).