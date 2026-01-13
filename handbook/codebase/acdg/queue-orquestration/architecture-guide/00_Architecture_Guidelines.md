Aqui está o documento definitivo ("A Lei") da arquitetura do seu projeto **QueueOrchestration**.

Este documento consolida todas as decisões tomadas: a estrutura de Monorepo, a separação estrita de camadas (Clean Architecture), o uso obrigatório de Protocol-Oriented Programming (POP) e a estratégia de exportação agnóstica via gRPC.

Salve este conteúdo como `ARCHITECTURE_GUIDELINES.md` na raiz do seu projeto.

-----

# 🏛️ QueueOrchestration Architecture Guidelines

> **STATUS:** APROVADO (A LEI)
>
> Este documento serve como a verdade única para a arquitetura do sistema. Desvios não justificados desta estrutura são considerados violações de design.

-----

## 1\. Princípios Fundamentais ("A Lei")

1.  **Protocol-Oriented Programming (POP) é Obrigatório:**

      * O *Core Domain* e o *Application* devem ser definidos via **Protocolos** (Comportamento) e implementados preferencialmente via **Structs** (Value Types).
      * Evite herança de classes. Use composição e extensões de protocolo.

2.  **Agnosticismo da Aplicação:**

      * A camada `Application` **NÃO** deve saber quem a chama (gRPC, REST, CLI, Testes).
      * A camada `Application` **NÃO** deve depender de frameworks externos (sem `import GRPC`, sem `import Vapor`).

3.  **Fluxo de Dependência Unidirecional:**

      * O fluxo de dependência aponta sempre para dentro (em direção ao Domínio).
      * *Infraestrutura* → *Adapters* → *Application* → *Core* → *Shared*.

4.  **Contratos como Fronteira:**

      * A comunicação externa é regida por contratos gRPC (Protobufs).
      * A comunicação interna é regida por Protocolos Swift (Input/Output Ports).

-----

## 2\. Estrutura do Projeto (Monorepo)

O projeto utiliza um **Single Package Monorepo** gerenciado pelo Swift Package Manager.

```text
queue-orquestration/
├── Package.swift                 <-- Configuração Mestra
├── Sources/
│   ├── Shared/                   <-- Camada 0: Tipos Comuns & Kernel
│   ├── Core/                     <-- Camada 1: Regras de Negócio (POP)
│   ├── Application/              <-- Camada 2: Casos de Uso (POP)
│   ├── InterfaceAdapters/        <-- Camada 3: Adaptadores
│   │   ├── GrpcProtos/           <-- Contratos .proto e código gerado
│   │   └── GrpcAdapter/          <-- Implementação do Servidor gRPC
│   └── ServiceRunner/            <-- Camada 4: Executável (Composition Root)
└── Tests/                        <-- Testes Unitários
```

-----

## 3\. Definição dos Módulos (Targets)

### 🟢 1. Shared (Kernel)

  * **Responsabilidade:** Tipos básicos, identificadores tipados (`TaggedID`), utilitários universais e protocolos base (`IdentifiableEntity`, `Validatable`).
  * **Dependências:** Nenhuma.
  * **Regra de Ouro:** Se for lógica de negócio específica, não pertence aqui.

### 🔵 2. Core (Domain)

  * **Responsabilidade:** Entidades, Value Objects, Agregados e Regras de Negócio Puras.
  * **Estilo:** Protocol-Oriented. Entidades são `structs` que conformam a protocolos de comportamento.
  * **Dependências:** `Shared`.
  * **Proibido:** Importar gRPC, UIKit, Foundation Networking.

<!-- end list -->

```swift
// Exemplo de Lei no Core:
public protocol QueueBehavior {
    var id: UUID { get }
    mutating func enqueue(_ entry: Entry) // Comportamento abstrato
}

public struct SpecialtyQueue: QueueBehavior { ... } // Implementação Value Type
```

### 🟡 3. Application (Use Cases)

  * **Responsabilidade:** Orquestração. Recebe um input, coordena as entidades do Core e persiste/retorna dados.
  * **Portas (Ports):** Define protocolos para o que precisa (`QueueRepositoryProtocol`) e para o que oferece (`CreateQueueUseCaseProtocol`).
  * **Dependências:** `Core`, `Shared`.
  * **Proibido:** Saber que existe um arquivo `.proto`.

<!-- end list -->

```swift
// Exemplo de Lei na Application:
public protocol CreateQueueUseCaseProtocol {
    func execute(input: CreateQueueInput) async throws -> SpecialtyQueue
}

public struct CreateQueueService: CreateQueueUseCaseProtocol { ... }
```

### 🟠 4. InterfaceAdapters (GrpcAdapter)

  * **Responsabilidade:** O "Tradutor". Implementa a interface do servidor gRPC gerada pelo Protobuf e chama os Casos de Uso da Application.
  * **Ação:** Converte `ProtoRequest` → `ApplicationInput` e `ApplicationOutput` → `ProtoResponse`.
  * **Dependências:** `Application`, `Core`, `GrpcProtos`, `gRPC-Swift`.

### 🔴 5. ServiceRunner (Main)

  * **Responsabilidade:** Composition Root. É o único lugar que instancia objetos concretos e monta o quebra-cabeça (Injeção de Dependência).
  * **Ação:** Inicializa o Repositório, injeta no Service, injeta no GrpcHandler e sobe o Servidor.

-----

## 4\. Configuração Oficial (`Package.swift`)

Este é o manifesto que viabiliza a arquitetura. Copie e mantenha atualizado.

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "QueueOrchestration",
    platforms: [ .macOS(.v12) ],
    products: [
        .executable(name: "QueueServiceRunner", targets: ["QueueServiceRunner"]),
    ],
    dependencies: [
        .package(url: "https://github.com/grpc/grpc-swift.git", from: "1.24.0"),
        .package(url: "https://github.com/apple/swift-protobuf.git", from: "1.26.0"),
        // Frameworks de teste (Quick/Nimble) podem ser adicionados aqui depois
    ],
    targets: [
        // --- DOMÍNIO PURO (SEM DEPENDÊNCIAS EXTERNAS) ---
        .target(
            name: "Shared",
            path: "Sources/Shared"
        ),
        .target(
            name: "Core",
            dependencies: ["Shared"],
            path: "Sources/Core"
        ),
        .target(
            name: "Application",
            dependencies: ["Core", "Shared"],
            path: "Sources/Application"
        ),

        // --- CAMADA DE ADAPTAÇÃO (MUNDO EXTERNO) ---
        .target(
            name: "GrpcContracts", // Contratos gerados
            dependencies: [
                .product(name: "SwiftProtobuf", package: "swift-protobuf"),
                .product(name: "GRPC", package: "grpc-swift"),
            ],
            path: "Sources/InterfaceAdapters/GrpcProtos"
        ),
        .target(
            name: "GrpcAdapter", // O Tradutor
            dependencies: [
                "Application",
                "GrpcContracts",
                .product(name: "GRPC", package: "grpc-swift")
            ],
            path: "Sources/InterfaceAdapters/GrpcAdapter"
        ),

        // --- ENTRY POINT ---
        .executableTarget(
            name: "QueueServiceRunner",
            dependencies: [
                "Application",
                "GrpcAdapter",
                "Core", // Necessário apenas para DI de tipos concretos se precisar
                .product(name: "GRPC", package: "grpc-swift"),
                .product(name: "NIO", package: "grpc-swift")
            ],
            path: "Sources/ServiceRunner"
        ),
    ]
)
```

-----

## 5\. Fluxo de Desenvolvimento (Receita de Bolo)

Para adicionar uma nova funcionalidade (Ex: "Remover Paciente da Fila"):

1.  **Defina o Protocolo no Core:** Crie o comportamento em `QueueBehavior` (ex: `mutating func remove(...)`).
2.  **Implemente no Core:** Atualize a struct `SpecialtyQueue`.
3.  **Defina o Caso de Uso na Application:** Crie `RemovePatientContract.swift` (Protocolo + Input Struct).
4.  **Implemente o Serviço na Application:** Crie `RemovePatientService.swift` (Struct que implementa o protocolo).
5.  **Atualize o Contrato Externo (.proto):** Adicione o RPC `RemovePatient`.
6.  **Implemente o Adaptador:** No `GrpcAdapter`, implemente a chamada gRPC, converta os dados e chame o serviço da Application.
7.  **Injete no Main:** No `ServiceRunner`, instancie o novo serviço e passe para o Handler.