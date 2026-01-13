Aqui está o documento consolidado **`06_Best_Practices_and_AntiPatterns.md`**.

Este guia é essencial para garantir a qualidade do código e serve como base para aprovação em Code Reviews. Ele compara diretamente o estilo "OOP Clássico" (que queremos evitar) com o estilo "Swift POP" (que é obrigatório).

-----

# 👮 06\_Best\_Practices\_and\_AntiPatterns.md

> **Propósito:** Guia visual de "Certo vs Errado" focado em Protocol-Oriented Programming, Injeção de Dependência e Encapsulamento.
> **Instrução para IA:** Use estes exemplos para refatorar código legado ou sugerir melhorias em Pull Requests. Se encontrar código marcado com ❌, sugira a refatoração para o modelo ✅.

-----

## 1\. Entidades de Domínio (Core)

**Regra:** O Core deve ser definido por comportamento (Protocolos) e dados imutáveis (Structs), nunca por herança de classes.

### ❌ Anti-Pattern: Herança e Referência (Estilo Java)

*Por que rejeitar?* Classes são *Reference Types* (mutabilidade imprevisível) e herança cria acoplamento rígido.

```swift
// ❌ RUIM: Classe Base e Herança
class FilaBase {
    var itens: [Ordem] = [] // Mutável publicamente
}

class FilaFisio: FilaBase { // Acoplamento forte
    func adicionar(_ ordem: Ordem) {
        self.itens.append(ordem) // Modifica referência compartilhada
    }
}
```

### ✅ Best Practice: Composição e Valor (Estilo Swift)

*Por que aprovar?* Structs são *Value Types* (Thread-safe por padrão). O comportamento é definido por contrato.

```swift
// ✅ BOM: Contrato de Comportamento
protocol QueueBehavior {
    var entries: [ServiceOrder] { get }
    mutating func enqueue(_ order: ServiceOrder) // 'mutating' indica cópia segura
}

// ✅ BOM: Struct Concreta (Isolada)
struct SpecialtyQueue: QueueBehavior {
    // Estado protegido contra escrita externa
    private(set) var entries: [ServiceOrder] = [] 
    
    mutating func enqueue(_ order: ServiceOrder) {
        entries.append(order)
        // Regra de ordenação aplicada localmente
    }
}
```

-----

## 2\. Injeção de Dependência (Application)

**Regra:** O `Application` nunca deve instanciar infraestrutura (Banco, API) diretamente. Deve receber dependências via construtor (Inversão de Dependência).

### ❌ Anti-Pattern: Acoplamento Forte

*Por que rejeitar?* Impossibilita testes unitários (Mocking) e troca de banco de dados.

```swift
class CreateQueueService {
    // ❌ RUIM: O serviço "conhece" o banco concreto
    let database = PostgresDatabase() 
    
    func execute() {
        let queue = SpecialtyQueue(...)
        database.save(queue) 
    }
}
```

### ✅ Best Practice: Protocol-Based Injection

*Por que aprovar?* O serviço depende apenas de uma abstração. O `ServiceRunner` decide quem injetar (Postgres, Memory, File).

```swift
// 1. Porta de Saída (Protocolo)
protocol QueueRepositoryProtocol {
    func save(_ queue: SpecialtyQueue) async throws
}

struct CreateQueueService {
    // ✅ BOM: Dependência abstrata
    private let repository: QueueRepositoryProtocol
    
    // Injeção obrigatória no init
    init(repository: QueueRepositoryProtocol) {
        self.repository = repository
    }
    
    func execute() async throws {
        // ... lógica ...
        try await repository.save(queue)
    }
}
```

-----

## 3\. Localização da Regra de Negócio

**Regra:** Regras de validação pertencem à Entidade (Core), não ao Serviço. Evite o *Anemic Domain Model*.

### ❌ Anti-Pattern: Modelo Anêmico

*Por que rejeitar?* A Entidade é apenas um "saco de dados". A regra de não duplicar está solta no Service, podendo ser esquecida em outros lugares.

```swift
// ❌ RUIM: Struct burra
struct SpecialtyQueue {
    var entries: [String]
}

// A inteligência está no lugar errado
class AddOrderService {
    func execute(queue: inout SpecialtyQueue, id: String) {
        if queue.entries.contains(id) { // Regra vazada
            throw Error.duplicated
        }
        queue.entries.append(id)
    }
}
```

### ✅ Best Practice: Rich Domain Model

*Por que aprovar?* A Entidade protege sua própria integridade. É impossível criar um estado inválido.

```swift
// ✅ BOM: Entidade Inteligente
struct SpecialtyQueue {
    private(set) var entries: [String]
    
    mutating func addEntry(_ id: String) throws {
        guard !entries.contains(id) else {
            throw DomainError.duplicateEntry // Regra encapsulada
        }
        entries.append(id)
    }
}

// O serviço apenas orquestra
struct AddOrderService {
    func execute(queue: inout SpecialtyQueue, id: String) throws {
        try queue.addEntry(id)
    }
}
```

-----

## 4\. Segurança de Tipos e Opcionais

**Regra:** Elimine *Primitive Obsession* (uso excessivo de Strings) e falhas catastróficas (`!`).

### ❌ Anti-Pattern: Force Unwrap & Magic Strings

*Por que rejeitar?* Risco alto de crash em runtime.

```swift
func process(id: String?) {
    let cleanId = id! // ❌ CRASH se nil
    
    if cleanId == "FISIO" { // ❌ String Mágica (frágil a typos)
        print("É fisio")
    }
}
```

### ✅ Best Practice: Guard & Tagged Types

*Por que aprovar?* Fail-fast seguro e uso de tipos do domínio.

```swift
func process(id: String?) throws {
    // ✅ Validação segura (Early Return)
    guard let validId = id, !validId.isEmpty else {
        throw ValidationError.missingID
    }
    
    // ✅ Conversão para Tipo Forte (Enum ou TaggedID)
    guard let specialty = SpecialtyID(rawValue: validId) else {
        throw ValidationError.invalidType
    }
    
    if specialty == .fisio { ... } // Compilador garante a existência
}
```

-----

## 5\. Checklist de Code Review

Ao abrir ou revisar um PR, verifique:

1.  [ ] **Sem Classes no Core/App:** Entidades e Services são `structs`?
2.  [ ] **Sem Herança:** Está usando Composição e Protocolos?
3.  [ ] **Agnosticismo:** Existe algum `import UIKit`, `SwiftUI` ou `GRPC` dentro da pasta `Sources/Application`? (Se sim, **Rejeite**).
4.  [ ] **Imutabilidade:** As propriedades de array/lista são `private(set)`?
5.  [ ] **Injeção:** O Service recebe o Repository via `init`?