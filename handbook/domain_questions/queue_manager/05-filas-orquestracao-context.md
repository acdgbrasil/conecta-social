# 📦 3.x — Filas & Orquestração Context (Core Domain)

> *Responsável por coordenar a presença diária do paciente, as Ordens de Serviço (OS) por especialidade e o fluxo das filas ao longo do dia.*

---

## 🎯 Objetivo deste contexto

Este contexto é o **núcleo do sistema de filas da ACDG**: ele modela a **Visita do Dia** de cada paciente, gera e gerencia as **OS por especialidade**, controla o estado das OS dentro das **filas por especialidade** e aplica as principais regras de negócio de **prioridade, carryover, faltas e cancelamentos**.

Ele:

- Representa a ida do paciente à unidade como uma `VisitaDoDia`.
- Decompõe essa visita em **vários atendimentos** (`OS`), um por especialidade.
- Coloca as OS `Prontas` nas **Filas de Especialidade** respeitando:
  - prioridade (`CarryOverMAX`, `Normal`, `CancelamentoPendente`),
  - ordem de chegada (FIFO),
  - e se o paciente está ou não ocupado em outra OS.
- Controla o ciclo de vida das OS e da Visita (`StatusOS`, `StatusVisita`).
- Publica **eventos de domínio** para Triagem, Atendimento Especialista, Painéis e Integrações.

---

## 🧠 Papel estratégico

- É o **Core Domain** do sistema de filas.
- Outros contextos orbitam em torno dele:
  - **Triagem Social** decide o **Plano de Atendimentos**;
  - **Atendimento Especialista** executa uma OS por vez;
  - **Painéis & Notificações** apenas projetam o que este contexto emite;
  - **Integrações** traduzem eventos/identidades para outros sistemas.
- Qualquer decisão sobre **justiça da fila, prioridade, presença, falta, cancelamento e auditoria** é feita aqui.

---

## 📦 Aggregates e Entidades do Contexto

### 1. Agregado Raiz: `VisitaDoDia`

> Representa a **presença do paciente em um dia específico**, com todas as OS daquele dia.

```ts
VisitaDoDia {
  id: IDVisita
  pacienteId: PacienteID
  data: LocalDate
  horaChegada: Instant
  status: EmAndamento | Concluída | EncerradaPeloDia
  flags: { temCarryOverPendentes: boolean }
  plano: OS[] // composição: 1..N OS
}
````

**Invariantes**:

* Uma `VisitaDoDia` está ligada a **um paciente** e **um dia**.
* Cada `OS` pertence **exclusivamente** à sua `VisitaDoDia`.
* Uma `OS` **não pode existir fora** do escopo da Visita.

**Principais comportamentos (métodos de domínio)**:

* `registrarChegada(pacienteId, data)` → cria nova `VisitaDoDia` (`PacienteChegou`).
* `adicionarOS(especialidadeId, prioridade)` → inclui OS no plano do dia (normalmente após Triagem).
* `marcarConcluida()` → quando **todas** as OS estão em estado final (`Concluída`, `Cancelada`, `NãoCompareceu`).
* `encerrarPeloDia()` → quando expediente acaba e ainda há OS não concluídas → `EncerradaPeloDia` + marca `temCarryOverPendentes = true`.

---

### 2. Entidade: `OrdemDeServiço (OS)`

> Cada OS representa **um atendimento a ser feito em uma especialidade** durante aquela Visita.

```ts
OS {
  id: OSID
  especialidadeId: EspecialidadeID
  prioridade: Normal | CarryOverMAX | CancelamentoPendente
  status: StatusOS
  profissionalId?: ProfissionalID
  timestamps: { criada, pronta?, chamado?, inicio?, fim? }
  prova?: ProvaDeAtendimento
}
```

**Regras principais**:

* `Pronta`:

  * paciente está **autenticado** (já passou pela Triagem),
  * especialidade está com **agenda ativa** no dia,
  * dentro da **Janela de Operação** da unidade (Seg–Sex, 08:00–17:00, horário Fortaleza).
* `Chamado`:

  * só pode ser feito por **Profissional da mesma especialidade**,
  * com **fila aberta**,
  * via operação atômica (`PegarProximo`) que reserva a OS (`OSReservada`).
* `EmAtendimento`:

  * exige registro de **presença do paciente** (`AtendimentoIniciado`).
* `Concluída`:

  * exige `ProvaDeAtendimento` anexada (foto de documento).
* Um paciente pode ter **N OS simultâneas**, mas só **1 OS em estado `EmAtendimento`** (Regra R2).

---

### 3. Agregado: `FilaEspecialidade`

> Representa a **fila lógica** de OS por especialidade, contendo apenas OS `Prontas` para serem chamadas.

```ts
FilaEspecialidade {
  especialidadeId: EspecialidadeID
  fila: Queue<OSID> // apenas OSs "Prontas"
}
```

**Política de consumo (pull)**:

1. **Prioridade**: `CarryOverMAX` > `Normal` > `CancelamentoPendente`.
2. Dentro da mesma prioridade: **FIFO** (ordem de chegada na Visita).
3. OS só é elegível se o paciente **não está ocupado** em outra OS (não está `EmAtendimento` em outro lugar).

**Operações típicas:**

* `enfileirar(osId, prioridade)` → adiciona OS quando entra em `Pronta`.
* `pegarProximo(profissional)` → aplica política de prioridade + FIFO + `BusyPatientPolicy`:

  * reserva OS (`status: Chamado`),
  * emite `OSReservada`,
  * garante atomicidade (`PegarProximo` é lockado, Regra R7).

---

### 4. Entidade: `Profissional` (visão do contexto de filas)

> Modela apenas os aspectos relevantes para filas: especialidade, estado da fila e disponibilidade.

```ts
Profissional {
  id: ProfissionalID
  especialidadeId: EspecialidadeID
  filaAberta: boolean
  agenda: DiasHoras
  estado: Disponível | Ocupado
}
```

**Comportamentos principais**:

* `abrirFila()`:

  * marca `filaAberta = true`,
  * dispara `ProfissionalAbriuFila`,
  * aciona política `Distribuição` para tentar `PegarProximo`.
* `concluirAtendimento(osId, prova)`:

  * valida prova,
  * marca OS como `Concluída`,
  * emite `AtendimentoConcluido`,
  * se `filaAberta` ainda for `true`, aciona nova `Distribuição`.
* `fecharFila()`:

  * marca `filaAberta = false`,
  * impede novos `PegarProximo` para aquele profissional.

> A **agenda detalhada** (dias da semana, horários específicos) é respeitada na transição para `Pronta` (Regra R8), mas o gerenciamento fino da agenda pode ficar em outro contexto de apoio futuramente.

---

## 🧩 Value Objects e Enums de domínio

Principais tipos usados dentro do contexto:

* `StatusOS`
  `Criada | Pronta | Chamado | EmAtendimento | Concluída | CancelamentoPendente | Cancelada | CarryOver | NãoCompareceu`

* `StatusVisita`
  `EmAndamento | Concluída | EncerradaPeloDia`

* `PrioridadeOS`
  `Normal | CarryOverMAX | CancelamentoPendente`

* `JanelaDeOperacao`

  * Seg–Sex, 08:00–17:00 (Fortaleza), com agenda por especialidade.

* `ProvaDeAtendimento`

  * Metadados mínimos:

    * `arquivoId` (ou hash),
    * `tipoDocumento`,
    * `timestampEnvio`.

---

## 🔄 Máquinas de Estado (Resumo visual)

### 1. Ciclo de vida da `OS`

```mermaid
stateDiagram-v2
  [*] --> Criada
  Criada --> Pronta: Janela ativa + paciente autenticado
  Pronta --> Chamado: reserva atômica (PegarProximo)
  Chamado --> EmAtendimento: presença registrada
  EmAtendimento --> Concluída: prova anexada

  Pronta --> CarryOver: encerramento da especialidade/dia
  Pronta --> CancelamentoPendente
  CancelamentoPendente --> Cancelada: social aprova
  Chamado --> NãoCompareceu: timeout do chamado

  [*] <-- Concluída
```

### 2. Ciclo de vida da `VisitaDoDia`

```mermaid
stateDiagram-v2
  [*] --> EmAndamento
  EmAndamento --> Concluída: todas OSs finalizadas
  EmAndamento --> EncerradaPeloDia: fim do expediente
  [*] <-- Concluída
```

---

## 📡 Eventos de Domínio principais

Os eventos publicados por este contexto são a “cola” com os demais bounded contexts.

| Evento                      | Gatilho / Descrição                                          |
| --------------------------- | ------------------------------------------------------------ |
| `PacienteChegou`            | Criação de nova `VisitaDoDia`                                |
| `TriagemConcluida`          | Triagem gera/atualiza PlanoDeAtendimentos (upstream Triagem) |
| `OSProntaGerada`            | OS passa para `Pronta` e entra na FilaEspecialidade          |
| `ProfissionalAbriuFila`     | Profissional disponível para puxar `PegarProximo`            |
| `OSReservada`               | OS foi chamada com lock atômico                              |
| `AtendimentoIniciado`       | Paciente presente na sala (OS → `EmAtendimento`)             |
| `ProvaDeAtendimentoAnexada` | Prova anexada, pronta pra concluir                           |
| `AtendimentoConcluido`      | OS → `Concluída`, libera profissional                        |
| `OSEntrouEmCarryOver`       | Encerramento do expediente com OS ainda `Pronta`             |
| `CancelamentoSolicitado`    | Paciente pede para sair da OS                                |
| `CancelamentoAprovado`      | Social aprova cancelamento, OS → `Cancelada`                 |
| `NaoCompareceuRegistrado`   | Timeout de `Chamado`, OS → `NãoCompareceu`                   |

Esses eventos são consumidos por:

* **Triagem Social** → ajusta Plano, registra justificativa de cancelamento.
* **Atendimento Especialista** → atualiza UI profissional, agenda interna.
* **Painéis & Notificações** → constroem modelos de leitura (público/paciente/gestão).
* **Integrações / Conecta Social / Terapias / Jurídico** → presença, frequência, carryover.

---

## 🔁 Políticas de Domínio (Sagas / Reações)

Algumas regras são melhor expressas como **políticas reativas** que respondem a eventos.

| Política            | Evento gatilho                                    | Ação                                                                                  |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Distribuição`      | `ProfissionalAbriuFila` ou `AtendimentoConcluido` | Tenta `PegarProximo()` na `FilaEspecialidade`, respeitando prioridade + FIFO          |
| `BusyPatientPolicy` | `OSReservada`                                     | Se paciente já estiver `EmAtendimento` em outra OS, pula para próxima OS elegível     |
| `EncerramentoDoDia` | `DiaEncerrado` (evento externo)                   | OS `Pronta` → `CarryOver`, `Visita` → `EncerradaPeloDia`, emite `OSEntrouEmCarryOver` |

Essas políticas costumam ser implementadas como **serviços de domínio** ou **process managers** que escutam os eventos do contexto.

---

## 📌 Regras de Negócio (Invariantes nucleares)

Extraído da seção de regras do domínio:

| #   | Regra                                                                   |
| --- | ----------------------------------------------------------------------- |
| R1  | Fila por especialidade é **FIFO** derivado da **ordem de chegada**      |
| R2  | Um paciente só pode estar `EmAtendimento` em **uma OS por vez**         |
| R3  | `CarryOverMAX` sempre fura a fila de prioridade `Normal`                |
| R4  | Cancelamento de OS **sempre requer aprovação** via relatório social     |
| R5  | `NãoCompareceu` = ausência no chamado ou no dia, conta como falta       |
| R6  | `Concluída` **exige** `ProvaDeAtendimento`                              |
| R7  | `PegarProximo` é **atômico e lockado**                                  |
| R8  | OS só vira `Pronta` se **janela de operação e agenda** forem válidas    |
| R9  | Paciente não pode estar **simultaneamente** em Triagem e Especialidades |
| R10 | **Auditoria obrigatória** de todos os eventos relevantes                |

---

## 🔗 Integração com outros contextos

Do ponto de vista de Filas & Orquestração:

* **Triagem Social (upstream)**:

  * fornece `PlanoDeAtendimentos` (lista de especialidades) após triagem.
  * emite `TriagemConcluida` e `CancelamentoAprovado`.
* **Atendimento Especialista**:

  * envia comandos: `AbrirFila`, `PegarProximo`, `RegistrarPresenca`, `AnexarProva`, `ConcluirAtendimento`, `FecharFila`.
  * recebe eventos: `OSReservada`, `AtendimentoIniciado`, `AtendimentoConcluido`.
* **Painéis & Notificações**:

  * apenas **escutam eventos** deste contexto para montar read models.
* **Integrações (Auth, People, Conecta Social, Terapias, Jurídico)**:

  * validam identidade/permissão,
  * consomem eventos como presença, faltas, carryover para outros domínios.

---

## 🔁 Fluxos típicos (histórias “filminho”)

### Fluxo 1 — Paciente chega e começa a jornada

1. `PacienteChegou` → cria `VisitaDoDia` em `EmAndamento`.
2. Triagem (em outro contexto) produz/atualiza o `PlanoDeAtendimentos` e dispara `TriagemConcluida`.
3. Filas & Orquestração:

   * cria OS por especialidade,
   * avalia janela/agenda,
   * marca algumas OS como `Pronta` → dispara `OSProntaGerada` e as enfileira.

### Fluxo 2 — Profissional abre fila e atende

1. Profissional envia comando `AbrirFila` → `ProfissionalAbriuFila`.
2. Política `Distribuição` roda:

   * chama `PegarProximo()` na `FilaEspecialidade`.
   * reserva OS → `Chamado` + `OSReservada`.
3. Paciente chega na sala → profissional registra presença → `AtendimentoIniciado` (OS → `EmAtendimento`).
4. Ao final, profissional anexa prova e conclui → `AtendimentoConcluido` (OS → `Concluída`).
5. `Distribuição` roda de novo automaticamente enquanto `filaAberta = true`.

### Fluxo 3 — Encerramento do dia e CarryOver

1. Ao fim do expediente, evento externo `DiaEncerrado` é emitido.
2. Política `EncerramentoDoDia`:

   * para cada OS ainda `Pronta`:

     * marca OS como `CarryOver`,
     * eleva `prioridade = CarryOverMAX`,
     * emite `OSEntrouEmCarryOver`.
   * `VisitaDoDia` → `EncerradaPeloDia`, `flags.temCarryOverPendentes = true`.

Na próxima visita desse paciente, essas OS de carryover entram com prioridade máxima na fila da especialidade (Regra R3).

---

## 📘 Glossário específico deste contexto

* **VisitaDoDia** — Sessão de presença do paciente em um dia específico na ACDG.
* **OS (OrdemDeServiço)** — Pedido de atendimento em uma especialidade para aquela visita.
* **FilaEspecialidade** — Estrutura FIFO lógica de OS `Prontas` por especialidade.
* **CarryOver** — OS não atendida no dia, promovida com prioridade máxima na próxima visita.
* **ProvaDeAtendimento** — Evidência (foto de documento) obrigatória para concluir uma OS.
* **JanelaDeOperação** — Horário de funcionamento da unidade (Seg–Sex, 08:00–17:00).
* **StatusOS / StatusVisita** — Estados da máquina de estado de OS e Visita.
* **PrioridadeOS** — Nível de prioridade da OS na fila (`Normal`, `CarryOverMAX`, `CancelamentoPendente`).

---