Aqui está o **Guia de Testes Unitários (Test Plan Guidelines)** completo para o seu sistema.

Este documento foi desenhado para guiar o ciclo **RED** do TDD. Ele descreve *o que* deve ser testado e *qual* o resultado esperado, sem dar o código pronto, forçando você a escrever a implementação para passar no teste.

Salve este arquivo como `TEST_PLAN_GUIDELINES.md`.

***

# 🧪 Plano de Testes Unitários (TDD Guide)

> **Escopo:** Core Domain & Application Layer
> **Metodologia:** Protocol-Oriented & Clean Architecture

---

## 🔵 1. Core Domain (Regras de Negócio)

Aqui testamos a lógica pura das Entidades e Value Objects. Não há mocks de banco de dados aqui, apenas manipulação de estado em memória.

### 1.1. Fila de Especialidade (`SpecialtyQueue`)

**Teste 1.1.1 - Ordenação Padrão (FIFO)**
* **Objetivo:** Garantir que pacientes com mesma prioridade são atendidos por ordem de chegada.
* **Cenário (Given/When):**
    1.  Criar uma `SpecialtyQueue` vazia (FISIO).
    2.  Adicionar `Ordem A` (Prioridade: Normal, Chegada: 10:00).
    3.  Adicionar `Ordem B` (Prioridade: Normal, Chegada: 10:05).
* **Resultado Obrigatório (Then):**
    * `queue.entries[0]` deve ser `Ordem A`.
    * `queue.entries[1]` deve ser `Ordem B`.

**Teste 1.1.2 - Fura-Fila por Prioridade**
* **Objetivo:** Garantir que Prioridade Alta passa na frente de Normal.
* **Cenário:**
    1.  Criar fila com `Ordem A` (Normal, 10:00).
    2.  Adicionar `Ordem B` (Prioridade, 10:05).
* **Resultado Obrigatório:**
    * `queue.entries[0]` deve ser `Ordem B` (Prioridade).
    * `queue.entries[1]` deve ser `Ordem A`.

**Teste 1.1.3 - CarryOver Supremo**
* **Objetivo:** Garantir que CarryOver tem prioridade máxima absoluta (Regra R3).
* **Cenário:**
    1.  Criar fila com `Ordem A` (Prioridade, 10:00).
    2.  Adicionar `Ordem B` (CarryOver, 12:00).
* **Resultado Obrigatório:**
    * `queue.entries[0]` deve ser `Ordem B` (mesmo tendo chegado depois).

**Teste 1.1.4 - Pull Next (Pular Paciente Ocupado)**
* **Objetivo:** Não chamar um paciente que já está sendo atendido em outra sala.
* **Cenário:**
    1.  Fila tem [`Ordem A` (Paciente 1), `Ordem B` (Paciente 2)].
    2.  Chamar `pullNext(excluding: [Paciente 1])`.
* **Resultado Obrigatório:**
    * O método retorna `Ordem B`.
    * `Ordem A` permanece na fila (ou é temporariamente ignorada, dependendo da regra, mas neste caso *pula*).
    * Se chamar novamente sem exclusão, retorna `Ordem A`.

**Teste 1.1.5 - Bloqueio de Duplicidade**
* **Objetivo:** Impedir que a mesma Ordem de Serviço entre duas vezes na fila.
* **Cenário:**
    1.  Fila já contém `Ordem A`.
    2.  Tentar `enqueue(Ordem A)` novamente.
* **Resultado Obrigatório:**
    * Lançar erro `DomainError.duplicateEntry`.
    * O tamanho da fila permanece inalterado.

---

### 1.2. Visita do Dia (`DailyVisit`)

**Teste 1.2.1 - Check-in Inicial**
* **Objetivo:** Validar criação de visita nova.
* **Cenário:**
    1.  Criar `DailyVisit` para Paciente X.
    2.  Executar `checkIn(timestamp: 08:00)`.
* **Resultado Obrigatório:**
    * Status deve ser `.checkIn`.
    * Data da visita deve ser a data corrente.
    * Lista de Ordens deve estar vazia.

**Teste 1.2.2 - Encerramento com Pendências (Gera CarryOver)**
* **Objetivo:** Marcar o paciente para prioridade amanhã se ele não foi atendido hoje.
* **Cenário:**
    1.  Visita tem `Ordem A` com status `.pending`.
    2.  Executar `closeDay()`.
* **Resultado Obrigatório:**
    * Status muda para `.closedWithPending`.
    * Flag `hasCarryOver` deve ser `true`.

**Teste 1.2.3 - Encerramento Limpo**
* **Objetivo:** Não gerar flag se tudo foi concluído.
* **Cenário:**
    1.  Visita tem `Ordem A` com status `.finished`.
    2.  Executar `closeDay()`.
* **Resultado Obrigatório:**
    * Status muda para `.finished`.
    * Flag `hasCarryOver` deve ser `false`.

---

### 1.3. Ordem de Serviço (`ServiceOrder`)

**Teste 1.3.1 - Fluxo de Vida Feliz**
* **Objetivo:** Validar transição Pending → InProgress → Finished.
* **Cenário:**
    1.  OS criada (`.pending`).
    2.  Chamar `startAttendance()`.
    3.  Chamar `finish(proof: ProvaValida)`.
* **Resultado Obrigatório:**
    * Após passo 2: Status `.inProgress`.
    * Após passo 3: Status `.finished` e propriedade `proof` preenchida.

**Teste 1.3.2 - Tentativa de Finalizar sem Prova**
* **Objetivo:** Garantir integridade (Regra de Compliance).
* **Cenário:**
    1.  OS em `.inProgress`.
    2.  Tentar `finish(proof: nil)` (se a assinatura permitir opcional) ou passar prova inválida.
* **Resultado Obrigatório:**
    * Lançar erro `DomainError.missingProof`.
    * Status permanece `.inProgress`.

---

## 🟡 2. Application Layer (Casos de Uso)

Aqui testamos a orquestração. Usamos **Mocks** para os Repositórios (`QueueRepositoryProtocol`, etc.) simulando o banco de dados.

### 2.1. Caso de Uso: Check-in (`CheckInService`)

**Teste 2.1.1 - Check-in de Sucesso**
* **Objetivo:** Criar uma visita e persistir.
* **Cenário:**
    1.  Mock do Repo retorna `nil` (não existe visita hoje).
    2.  Chamar `execute(patientID: "123")`.
* **Resultado Obrigatório:**
    1.  Deve chamar `repo.save(...)` com uma nova visita.
    2.  Retornar a visita criada com status `.checkIn`.

**Teste 2.1.2 - Check-in Duplicado (Idempotência)**
* **Objetivo:** Não criar duas visitas para o mesmo paciente no mesmo dia.
* **Cenário:**
    1.  Mock do Repo retorna uma `Visita Existente` para hoje.
    2.  Chamar `execute(patientID: "123")`.
* **Resultado Obrigatório:**
    1.  **NÃO** deve chamar `repo.save(...)` (ou chamar update se for lógica de reativar).
    2.  Deve retornar a visita existente.
    3.  Não deve lançar erro (opcional: lançar erro se a regra for estrita, mas geralmente retorna a existente).

---

### 2.2. Caso de Uso: Gerar Ordens (`GenerateOrdersService`)

**Teste 2.2.1 - Distribuição Simples**
* **Objetivo:** Receber plano da Triagem e criar OS nas filas corretas.
* **Cenário:**
    1.  Input: Paciente "123", Especialidades ["FISIO", "NUTRI"].
    2.  Mocks: `QueueRepo` retorna filas vazias para FISIO e NUTRI.
* **Resultado Obrigatório:**
    1.  Deve salvar 2 novas `ServiceOrder` no `OrderRepo`.
    2.  Deve chamar `queueRepo.save(fisioQueue)` contendo a nova ordem.
    3.  Deve chamar `queueRepo.save(nutriQueue)` contendo a nova ordem.

**Teste 2.2.2 - Prioridade CarryOver Automática**
* **Objetivo:** Se o paciente tem flag de CarryOver, a ordem nasce com prioridade máxima.
* **Cenário:**
    1.  Mock `VisitRepo` retorna visita anterior com `hasCarryOver = true`.
    2.  Input: Especialidade ["FISIO"].
* **Resultado Obrigatório:**
    1.  A `ServiceOrder` criada deve ter `priority = .carryOverMax`.
    2.  A `SpecialtyQueue` deve colocá-la no topo.

---

### 2.3. Caso de Uso: Chamar Próximo (`CallNextPatientService`)

**Teste 2.3.1 - Chamar com Sucesso**
* **Objetivo:** Retirar paciente da fila e iniciar atendimento.
* **Cenário:**
    1.  Fila FISIO tem [`Ordem A`].
    2.  Input: Profissional "Dr. House", Sala "01".
* **Resultado Obrigatório:**
    1.  Retornar `Ordem A`.
    2.  `Ordem A` deve ter status atualizado para `.inProgress`.
    3.  Fila FISIO salva no repo deve estar vazia.
    4.  Evento `AttendanceStarted` deve ser disparado.

**Teste 2.3.2 - Fila Vazia**
* **Objetivo:** Tratar graciosamente a falta de pacientes.
* **Cenário:**
    1.  Fila FISIO vazia.
    2.  Input: Chamar próximo.
* **Resultado Obrigatório:**
    1.  Lançar erro `ApplicationError.queueIsEmpty` ou retornar `nil`.
    2.  Nenhuma alteração em repositórios.

**Teste 2.3.3 - Conflito de Paciente (Collision)**
* **Objetivo:** Não chamar paciente que está na NUTRI agora.
* **Cenário:**
    1.  Fila FISIO tem [`Ordem A` (Paciente X), `Ordem B` (Paciente Y)].
    2.  Mock `ActiveAttendanceRepo` diz que Paciente X está "Em Atendimento" na NUTRI.
* **Resultado Obrigatório:**
    1.  Retornar `Ordem B` (Paciente Y).
    2.  `Ordem A` permanece na fila FISIO na posição 0 (ou é ignorada momentaneamente).

---

## 🔴 3. Interface Adapters (Validation)

### 3.1. DTO Validation (Input)

**Teste 3.1.1 - IDs Inválidos**
* **Objetivo:** Não deixar chegar lixo no Application.
* **Cenário:**
    1.  gRPC Request com `specialty_id = ""` (vazio).
* **Resultado Obrigatório:**
    1.  Adaptador deve lançar `ValidationError` antes de chamar o UseCase.

**Teste 3.1.2 - Prioridade Fora do Range**
* **Objetivo:** Proteger integridade dos enums.
* **Cenário:**
    1.  gRPC Request com `priority = 999` (inexistente).
* **Resultado Obrigatório:**
    1.  Adaptador converte para valor default (Normal) OU lança erro (depende da sua regra). Vamos assumir: Lançar erro.