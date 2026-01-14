Aqui está o documento consolidado **`01_Package_Structure_Monorepo.md`**.

Ele unifica a evolução das regras, apresentando a versão final e mais robusta da arquitetura (baseada na *Rule 3* e *Rule 5*), onde a camada `Application` permanece puramente agnóstica (sem dependência de gRPC).

-----

# 📦 01\_Package\_Structure\_Monorepo.md

> **Propósito:** Definir a estrutura física do Monorepo, a configuração do `Package.swift` e a árvore estrita de dependências entre os módulos.
> **Instrução para IA:** Consulte este arquivo para verificar se as importações e dependências no `Package.swift` estão corretas e isoladas. A camada `Application` JAMAIS deve importar `GRPC` ou `Vapor`.

-----

## 1\. Estrutura de Pastas (File System)

O projeto segue uma estrutura de **Monorepo Swift Package**, separando camadas lógicas em diretórios físicos distintos.

```text
queue-orquestration/
├── Package.swift                 # Manifesto de Build (Single Source of Truth)
├── Sources/
│   ├── Shared/                   # Camada 0: Kernel (Enums, TaggedIDs, Utils)
│   ├── Core/                     # Camada 1: Regras de Negócio Puras (Entidades, VOs)
│   ├── Application/              # Camada 2: Casos de Uso (Orquestração)
│   ├── InterfaceAdapters/        # Camada 3: Adaptadores de Entrada/Saída
│   │   ├── GrpcProtos/           # Contratos .proto + Código Swift gerado
│   │   └── GrpcAdapter/          # Implementação do Servidor gRPC
│   └── ServiceRunner/            # Camada 4: Executável (Composition Root)
└── Tests/                        # Testes Unitários (Espelham a estrutura de Sources)
```

-----

## 2\. Árvore de Dependências

A regra de ouro é o **Fluxo Unidirecional para o Centro**. Infraestrutura depende de Domínio, nunca o contrário.

| Módulo (Target) | Tipo | Depende de... | Descrição |
| :--- | :--- | :--- | :--- |
| **Shared** | Library | *Nenhuma* | Tipos universais, sem lógica de negócio complexa. |
| **Core** | Library | `Shared` | Entidades, Regras e Protocolos de Domínio. **Puro Swift.** |
| **Application** | Library | `Core`, `Shared` | Casos de Uso (Services). **Puro Swift** (Agnóstico de Frameworks). |
| **GrpcContracts**| Library | `SwiftProtobuf`, `GRPC` | Contratos gerados a partir de arquivos `.proto`. |
| **GrpcAdapter** | Library | `Application`, `GrpcContracts` | Tradutor: Converte Proto ↔ Domínio e chama Casos de Uso. |
| **ServiceRunner**| Executable | `Application`, `GrpcAdapter`, `Core` | Ponto de Entrada (`main`). Faz a Injeção de Dependência. |

-----

## 3\. O Arquivo `Package.swift` (Definitivo)

Copie este conteúdo para a raiz do projeto. Ele garante o isolamento das camadas através do sistema de módulos do Swift.

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "QueueOrchestration",
    platforms: [
        .macOS(.v12) // Define o target mínimo de deployment
    ],
    products: [
        // O único binário executável gerado
        .executable(name: "QueueServiceRunner", targets: ["QueueServiceRunner"]),
        
        // (Opcional) Se precisar exportar o domínio para outros apps no futuro:
        // .library(name: "QueueDomain", targets: ["Application", "Core", "Shared"]),
    ],
    dependencies: [
        // Dependências de Infraestrutura (gRPC)
        .package(url: "https://github.com/grpc/grpc-swift.git", from: "1.24.0"),
        .package(url: "https://github.com/apple/swift-protobuf.git", from: "1.26.0"),
    ],
    targets: [
        // MARK: - Camada 1: Domínio (Puro & Agnóstico)
        // Estes módulos NÃO devem depender de gRPC, Vapor ou bibliotecas externas de I/O.
        
        .target(
            name: "Shared",
            dependencies: [],
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

        // MARK: - Camada 2: Infraestrutura & Contratos
        // Estes módulos lidam com o "mundo exterior" (Rede, Serialização).

        // Contém apenas os arquivos .proto e o código Swift gerado (Messages + Server Protocols)
        .target(
            name: "GrpcContracts",
            dependencies: [
                .product(name: "SwiftProtobuf", package: "swift-protobuf"),
                .product(name: "GRPC", package: "grpc-swift"),
            ],
            path: "Sources/InterfaceAdapters/GrpcProtos"
        ),
        
        // Implementa os Handlers do gRPC, traduzindo DTOs e chamando o Application
        .target(
            name: "GrpcAdapter",
            dependencies: [
                "Application",      // Para chamar a lógica de negócio
                "GrpcContracts",    // Para ler/escrever Protos
                .product(name: "GRPC", package: "grpc-swift")
            ],
            path: "Sources/InterfaceAdapters/GrpcAdapter"
        ),

        // MARK: - Camada 3: Composition Root (Executável)
        
        // Apenas inicializa o servidor e conecta as peças (Injeção de Dependência)
        .executableTarget(
            name: "QueueServiceRunner",
            dependencies: [
                "Application",
                "GrpcAdapter",
                "Core", // Necessário apenas para instanciar implementações concretas na main
                .product(name: "GRPC", package: "grpc-swift"),
                .product(name: "NIO", package: "grpc-swift") // Necessário para configurar o EventLoopGroup
            ],
            path: "Sources/ServiceRunner"
        ),
    ]
)
```

## 4\. Regras de Manutenção

1.  **Proibido Circularidade:** `Core` nunca pode importar `Application`.
2.  **Application Protegida:** Se você precisar adicionar uma biblioteca de log ou métricas no `Application`, prefira criar um protocolo no `Application` e implementar a biblioteca no `ServiceRunner` ou `Adapters`.
3.  **Geração de Protos:** O código em `GrpcContracts` é gerado automaticamente. Evite editar manualmente arquivos dentro deste target.