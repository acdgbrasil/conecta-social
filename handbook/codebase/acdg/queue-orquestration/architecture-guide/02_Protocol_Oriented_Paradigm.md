Aqui está o documento consolidado **`02_Protocol_Oriented_Paradigm.md`**.

Este arquivo unifica os conceitos de "Protocol-Oriented Programming" (POP) com as modernidades do Swift 6.0, servindo como o guia definitivo de estilo de codificação para o projeto.

-----

# 🧬 02\_Protocol\_Oriented\_Paradigm.md

> **Propósito:** Estabelecer o paradigma **Protocol-Oriented Programming (POP)** como padrão obrigatório. Define como usar Structs, Protocolos, Mixins e recursos do Swift 6.0 (Typed Throws, Static Dispatch).
> **Instrução para IA:** Valide se o código usa **Protocolos** para abstração e **Structs** para dados. O uso de `class` para Entidades de Domínio é **proibido**. Herança de classe é considerada um anti-padrão neste projeto.

-----

## 1\. O Manifesto POP (A Lei)

Ao contrário de linguagens como Java ou C\#, o Swift brilha quando evitamos Classes e Herança.

1.  **Composição \> Herança:** Nunca crie uma `BaseClass` para compartilhar código. Use **Protocol Extensions** (Mixins).
2.  **Value Types (Structs) \> Reference Types (Classes):**
      * **Entidades (Core):** Devem ser `structs`.
      * **Serviços (Application):** Devem ser `structs` (stateless).
      * **DTOs:** Devem ser `structs`.
      * *Exceção:* `Classes` são permitidas apenas em adaptadores de infraestrutura que exigem identidade de referência (ex: `NIO EventLoopFuture` ou Wrappers de Banco de Dados legados), mas nunca no Domínio.
3.  **Abstração via Protocolos:** Nenhuma camada deve depender de uma implementação concreta (`struct`), mas sim de um contrato (`protocol`).

-----

## 2\. Estruturas de Código (Patterns)

### A. Traits (Shared Kernel)

Definem capacidades pequenas e reutilizáveis.

```swift
// ✅ BOM: Trait reutilizável
public protocol IdentifiableEntity {
    associatedtype ID: Hashable
    var id: ID { get }
}

public protocol Validatable {
    func validate() throws(DomainError) // Swift 6 Typed Throws
}
```

### B. Comportamento (Core Domain)

O Domínio define "o que algo faz", não apenas "o que ele tem".

```swift
// 1. Definição do Comportamento (Abstração)
public protocol QueueBehavior: IdentifiableEntity, Validatable {
    var entries: [Entry] { get }
    
    // 'mutating' é seguro em structs (cria uma nova cópia otimizada na Stack)
    mutating func enqueue(_ entry: Entry)
}

// 2. Implementação Concreta (Value Type)
public struct SpecialtyQueue: QueueBehavior {
    public let id: UUID
    public private(set) var entries: [Entry] = []

    public mutating func enqueue(_ entry: Entry) {
        entries.append(entry)
    }
    
    public func validate() throws(DomainError) {
        if entries.count > 100 { throw .queueOverflow }
    }
}
```

### C. Mixins (Substituindo Classes Base)

Se você tem lógica repetida, use Extensões de Protocolo. Isso habilita **Static Dispatch** (performance superior a herança).

```swift
// ✅ BOM: Lógica compartilhada sem herança
extension QueueBehavior {
    // Todo mundo que conforma a QueueBehavior ganha isso de graça
    public var isEmpty: Bool {
        return entries.isEmpty
    }
}

// ✅ BOM: Comportamento condicional (Constraint-based)
extension QueueBehavior where Self: Prioritizable {
    public mutating func reorder() {
        // Lógica de reordenação que só existe se a fila for Priorizável
    }
}
```

-----

## 3\. Recursos do Swift 6.0 (Otimização & Segurança)

### A. Typed Throws

Evite `throws` genéricos. O Swift 6 permite tipar o erro, eliminando `do-catch` genéricos e garantindo exaustividade no tratamento.

```swift
// ❌ RUIM (Swift 5)
func process() throws -> void // Pode lançar qualquer coisa?

// ✅ BOM (Swift 6)
func process() throws(DomainError) -> void // O compilador garante que é DomainError
```

### B. Parameterized Extensions

Use extensões restritas para evitar código duplicado em tipos genéricos como `TaggedID`.

```swift
// Adiciona funcionalidade APENAS para IDs de Paciente
extension TaggedID where Tag == PatientTag {
    func maskMedicalRecord() -> String { "***" }
}
```

### C. Opaque Types (`some`)

Use `some Protocol` nos retornos para ocultar a implementação concreta (Information Hiding), mantendo a performance do Static Dispatch.

```swift
// A Application não precisa saber que é 'SpecialtyQueue', só que 'se comporta como fila'
func createQueue() -> some QueueBehavior {
    return SpecialtyQueue(...)
}
```

-----

## 4\. Injeção de Dependência (Protocol-Based)

A camada `Application` deve usar **Constructor Injection** baseada em protocolos.

```swift
// 1. Input Port (Dependência)
public protocol QueueRepositoryProtocol {
    func save(_ queue: some QueueBehavior) async throws(InfrastructureError)
}

// 2. Service (Consumidor)
public struct CreateQueueService {
    private let repository: QueueRepositoryProtocol

    // Injeção
    public init(repository: QueueRepositoryProtocol) {
        self.repository = repository
    }
    
    public func execute() async throws(DomainError) {
        // ... lógica ...
    }
}
```

-----

## 5\. Checklist para Code Review (IA & Humano)

Ao validar um Pull Request, rejeite se encontrar:

1.  ❌ **Herança de Classe:** `class MyService: BaseService { ... }`.
2.  ❌ **Shared Mutable State:** Singletons globais (`Service.shared`) que guardam estado.
3.  ❌ **Tipos Concretos na Assinatura Pública:** Expor `SpecialtyQueue` em vez de `QueueBehavior` em fronteiras de módulo.
4.  ❌ **Force Unwrap:** Uso de `!` ou `try!`.
5.  ❌ **Any Error:** Uso de `throw Error("string")` em vez de Enums tipados.