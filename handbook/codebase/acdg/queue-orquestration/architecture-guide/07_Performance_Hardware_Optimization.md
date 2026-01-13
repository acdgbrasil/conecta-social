Aqui está o documento consolidado **`07_Performance_Hardware_Optimization.md`**.

Este documento é crítico para garantir que o sistema não apenas "funcione", mas opere de forma estável e rápida no hardware limitado do Raspberry Pi.

-----

# ⚡ 07\_Performance\_Hardware\_Optimization.md

> **Propósito:** Definir as otimizações de compilador, gerenciamento de threads e práticas de código necessárias para rodar em hardware Low-End (Raspberry Pi 3B+).
> **Instrução para IA:** Considere as restrições de hardware (1GB RAM, CPU ARM Cortex-A53) ao sugerir bibliotecas. Evite frameworks pesados ou que dependam de "Reflection" excessivo. Prefira abordagens que utilizem *Static Dispatch* e alocação na *Stack*.

-----

## 1\. O Hardware Alvo (Target Environment)

O sistema é projetado para operar em dispositivos de borda (Edge Computing) com recursos finitos.

  * **Device:** Raspberry Pi 3 Model B+ (ou equivalente).
  * **CPU:** Broadcom BCM2837B0, Cortex-A53 (ARMv8) 64-bit SoC @ 1.4GHz.
  * **RAM:** 1GB LPDDR2 SDRAM.
  * **Storage:** SD Card (I/O Lento).

**Restrição Crítica:** A memória é o recurso mais escasso. O uso de Swap deve ser evitado para não degradar o cartão SD. O *Cold Start* deve ser rápido e o *Runtime footprint* deve ser baixo (\< 50MB).

-----

## 2\. Por que Swift POP? (Justificativa Técnica)

A escolha de Swift com Protocol-Oriented Programming não é estética, é uma decisão de engenharia para este hardware.

1.  **Zero VM Overhead:** Ao contrário de Java ou Node.js, Swift compila para nativo. Não há custo de 100MB+ de RAM apenas para subir a Máquina Virtual (JVM/V8).
2.  **ARC vs Garbage Collection:** O Cortex-A53 sofre com "Stop-the-world" de GCs tradicionais. O Swift usa *Automatic Reference Counting* (ARC), que é determinístico e dilui o custo de limpeza memória instrução a instrução.
3.  **Stack Allocation:** O uso obrigatório de `structs` (definido na Regra 02) garante que a maior parte dos dados efêmeros viva na *Stack* (L1/L2 Cache), aliviando a pressão na RAM (Heap).
4.  **Static Dispatch:** O uso de Generics e Protocolos permite que o compilador resolva chamadas em tempo de build, poupando ciclos de CPU em runtime.

-----

## 3\. Configuração de Build (Compilador)

Para produção, o binário deve ser otimizado para **Tamanho** (reduzindo *Cache Misses* na CPU) e não apenas velocidade bruta.

**Comando de Build Oficial:**

```bash
swift build -c release --Xswiftc -Osize
```

  * `-c release`: Desativa símbolos de debug e ativa otimizações padrão.
  * `--Xswiftc -Osize`: Instrui o compilador LLVM a priorizar binários menores. Isso é vital para processadores com cache L2 pequeno como o Cortex-A53.

-----

## 4\. Runtime & Concorrência (SwiftNIO)

O SwiftNIO (base do gRPC) tenta, por padrão, criar 1 Thread de EventLoop por Core lógico. No RPi, isso pode causar *Context Switching* excessivo se o sistema operacional também estiver ocupado.

**Ajuste Obrigatório no `ServiceRunner`:**

Devemos limitar o número de threads de I/O para deixar cores livres para o processamento de regras de negócio e sistema operacional.

```swift
import NIO

// No Raspberry Pi (4 Cores), usar 4 threads de IO pode ser agressivo demais.
// Use metade para I/O de rede, deixe o resto para computação do Core.
let elGroup = MultiThreadedEventLoopGroup(numberOfThreads: 2)

let server = Server.insecure(group: elGroup)
    .withServiceProviders([grpcHandler])
    .bind(host: "0.0.0.0", port: 8080)
```

**Opcional (Gerenciador de Memória):**
Para sistemas de longa duração, o alocador padrão do Linux (`glibc`) pode fragmentar memória. Recomenda-se usar `jemalloc`.

```bash
# No Linux (Docker ou Systemd unit):
apt-get install libjemalloc2
export LD_PRELOAD=/usr/lib/aarch64-linux-gnu/libjemalloc.so.2
./QueueServiceRunner
```

-----

## 5\. Micro-Otimizações de Código

Estas práticas devem ser aplicadas no *Core* e *Application* para evitar picos de alocação.

### A. `reserveCapacity`

Se você sabe o tamanho aproximado de uma lista, avise o compilador. Isso evita realocações de memória custosas (cópias de array).

```swift
// ✅ BOM
var dailyOrders = [ServiceOrder]()
dailyOrders.reserveCapacity(500) // Aloca memória contígua uma única vez
```

### B. Contiguous Memory Layout

Confie nas estruturas padrão (`Array`, `Dictionary`). Como usamos `structs`, o Swift armazena os dados de forma contígua na memória (como um array em C), o que é amigável ao Cache da CPU.

  * **Evite:** Criar *Linked Lists* manuais ou grafos de objetos baseados em classes.
  * **Use:** Arrays planos e índices.

-----

## 6\. Testes de Performance (Regressão)

Use o `XCTMetric` para garantir que novos PRs não introduzam vazamentos de memória ou algoritmos lentos.

**Arquivo:** `Tests/CoreTests/PerformanceTests.swift`

```swift
import XCTest
import Core

final class PerformanceTests: XCTestCase {
    func testQueueProcessingBenchmarks() {
        let metrics: [XCTMetric] = [
            XCTMemoryMetric(), // Falha se o uso de RAM explodir
            XCTCPUMetric()     // Falha se o uso de CPU for excessivo
        ]
        
        measure(metrics: metrics) {
            var queue = SpecialtyQueue(specialtyID: .init(rawValue: "TEST"))
            // Simula carga de pico
            for i in 0..<10_000 {
                queue.enqueue(ServiceOrder(priority: .normal))
            }
            _ = queue.pullNext(excluding: [])
        }
    }
}
```

> **Nota:** Defina o `baseline` rodando os testes no CI ou no hardware alvo. O teste deve falhar se a performance degradar mais que 10-15% em relação ao baseline.