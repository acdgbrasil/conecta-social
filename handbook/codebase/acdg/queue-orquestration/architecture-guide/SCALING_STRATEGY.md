# 🚀 Estratégia de Evolução: De Monólito Modular para Sistema Distribuído

> **Objetivo:** Permitir que o sistema escale horizontalmente (adicionando mais máquinas/hardware) sem reescrever as Regras de Negócio.
> **Pré-requisito:** A arquitetura atual (Clean Arch + POP) deve estar implementada.

-----

## 1\. O Conceito: "Stateless Application, Stateful Infrastructure"

Para rodar em 10, 100 ou 1000 máquinas simultaneamente, a sua aplicação (`ServiceAPI` e `ServiceWorker`) não pode guardar dados na memória RAM (`var array = []`).

**A Evolução do Código:**
Você vai trocar as implementações dos Protocolos de Repositório.

  * **Hoje (Single Node):** `InMemoryQueueRepository` (guarda num Array).
  * **Amanhã (Distributed):** `PostgresQueueRepository` ou `RedisQueueRepository` (guarda num banco externo compartilhado).

O `Core` e a `Application` **continuam iguais**. Eles só chamam `repository.save()`. Eles não sabem se salvou na RAM ou num Cluster Postgres na AWS.

-----

## 2\. Passo a Passo da Evolução

### Passo 1: Externalizar o Estado (Shared Database)

Todas as instâncias do serviço devem apontar para o mesmo "lugar da verdade".

**Código Novo (Infraestrutura):**
Crie um novo adaptador em `Sources/InterfaceAdapters/Repositories/Postgres`:

```swift
// Em vez de guardar na memória, faz SQL
struct PostgresQueueRepository: QueueRepositoryProtocol {
    let db: PostgresClient // Driver externo
    
    func save(_ queue: SpecialtyQueue) async throws {
        // Serializa a Struct (JSON/SQL) e grava no banco
        // INSERT INTO queues (id, data) VALUES (...) ON CONFLICT UPDATE
    }
    
    func get(by id: String) async throws -> SpecialtyQueue? {
        // SELECT * FROM queues WHERE id = ...
        // Deserializa para a Struct 'SpecialtyQueue'
    }
}
```

**No `ServiceRunner/main.swift`:**

```swift
// Antes:
// let repo = InMemoryQueueRepository()

// Depois (Escalável):
let repo = PostgresQueueRepository(connectionString: env("DB_URL"))
```

### Passo 2: Controle de Concorrência (Race Conditions)

Quando você tem 20 máquinas rodando o `ServiceWorker`, duas podem tentar fazer `pullNext()` na mesma fila ao mesmo tempo e pegar o mesmo paciente.

**Solução A: Optimistic Locking (Via Banco)**
Adicione uma versão (`_version`) na sua entidade `SpecialtyQueue`.

  * **Cenário:** Worker A e Worker B leem a Fila (Versão 1).
  * Worker A salva Fila (Versão 2). Sucesso.
  * Worker B tenta salvar Fila (Versão 2). **ERRO DE CONFLITO** (O banco esperava Versão 1, mas já está na 2).
  * Worker B captura o erro, relê a fila atualizada e tenta de novo.

**Solução B: Pessimistic Locking / Atomic Updates (Recomendado para Filas)**
Usar recursos do banco (como `SELECT FOR UPDATE` ou comandos atômicos do Redis) dentro da implementação do Repositório.

**Exemplo de Evolução no Repositório (Invisível para o Core):**

```swift
func pullNext(excluding patients: [ID]) async throws -> Entry? {
    // SQL Nativo que garante atomicidade
    // UPDATE queue_entries 
    // SET status = 'PROCESSING', worker_id = 'me'
    // WHERE id = (
    //    SELECT id FROM queue_entries 
    //    WHERE status = 'WAITING' 
    //    LIMIT 1 
    //    FOR UPDATE SKIP LOCKED 
    // )
    // RETURNING *;
}
```

-----

## 3\. Topologia Distribuída

Como fica a arquitetura física quando você "adiciona hardware":

1.  **Load Balancer (NGINX / AWS ALB):**

      * Recebe a requisição gRPC externa.
      * Distribui (Round-Robin) entre `ServiceAPI Node 1`, `ServiceAPI Node 2`, etc.

2.  **Service API Cluster (Stateless):**

      * Recebe o gRPC.
      * Instancia o `UseCase`.
      * Carrega dados do Redis/Postgres.
      * Processa (Core).
      * Salva.
      * Pode escalar de 1 para 100 réplicas instantaneamente.

3.  **Service Worker Cluster (Stateless):**

      * Fica num loop eterno perguntando ao Banco/Redis: "Tem trabalho?".
      * Graças ao **Locking** (Passo 2), eles nunca pegam o mesmo trabalho.
      * Se a fila está grande, você sobe mais 50 containers desse Worker.

4.  **Camada de Dados (Stateful):**

      * **Postgres:** Dados persistentes (Histórico, Visitas, Provas).
      * **Redis (Opcional):** Filas "Hot" para altíssima performance (milhões de req/s).

-----

## 4\. Checklist para "Ativar" o Modo Distribuído

Para mudar do modo "Desenvolvimento Local" para "Produção Distribuída", você só precisa mexer no `ServiceRunner` (Main).

1.  **Configuração via Variáveis de Ambiente:**
    O código deve ler `DB_HOST`, `DB_PORT`, `REDIS_URL` do ambiente.

2.  **Health Checks:**
    Implemente uma rota gRPC simples `CheckHealth` que retorna `OK` se conseguir conectar no Banco. O Load Balancer usa isso para saber se a máquina está viva.

3.  **Logs Centralizados:**
    Em vez de `print()`, use uma lib de Log que envie JSON para um agregador (ELK, CloudWatch), pois você terá logs espalhados em 10 máquinas.

-----

## 5\. Exemplo Prático de Código "Main" Escalável

```swift
// Sources/ServiceRunner/main.swift

// Verifica se estamos rodando local ou cluster
let isClusterMode = ProcessInfo.processInfo.environment["MODE"] == "CLUSTER"

// Injeção de Dependência Dinâmica
let repository: QueueRepositoryProtocol

if isClusterMode {
    // MODO HARDCORE (Produção)
    // Conecta no AWS RDS ou Redis Cluster
    repository = PostgresQueueRepository(url: ...)
    print("🚀 Rodando em modo CLUSTER (Stateless)")
} else {
    // MODO DEV (Simples)
    repository = InMemoryQueueRepository()
    print("⚠️ Rodando em modo LOCAL (In-Memory)")
}

// O resto do sistema NÃO MUDA NADA
let service = CreateQueueService(repository: repository)
let handler = QueueGrpcHandler(useCase: service)

// Sobe o servidor...
```

### Resumo

A sua arquitetura **JÁ ESTÁ PRONTA**.
Para "ativar" o poder de escalar:

1.  Crie implementações reais dos Repositórios (`Postgres/Redis`).
2.  Garanta locking no banco de dados.
3.  Coloque um Load Balancer na frente.
4.  Adicione hardware à vontade.
