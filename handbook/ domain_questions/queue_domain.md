# 📘 Documento Oficial: Modelo de Domínio — ACDG Gestão de Filas

### Documento: `modelo-dominio-acdg-v0.1.md`

**Versão**: 0.1
**Autor de domínio**: Domain Driven Design Architect
**Data**: 2025-11-07
**Fonte**: Conversão estruturada de artefatos DDD + Lean UX fornecidos por `gabriel`

---

## ✳️ Visão Geral

Este documento formaliza o **modelo de domínio** para o sistema de **Gestão de Filas da unidade ACDG**, com base nos princípios de Domain-Driven Design (Evans, 2003), práticas de modelagem tática e estratégica, linguagem ubíqua e processos de descoberta orientados por valor (Lean UX, Design Thinking).

O objetivo do sistema é **orquestrar atendimentos presenciais** por ordem de chegada, **maximizando fluidez** entre múltiplas especialidades, com **fila única derivada por especialidade**, atendida por 1..N profissionais simultaneamente.

---

## 1. 🌐 Mapa de Contexto (Bounded Contexts)

| Bounded Context                 | Responsabilidade                                                | Tipo de Integração |
| ------------------------------- | --------------------------------------------------------------- | ------------------ |
| **Filas & Orquestração (Core)** | Coordena VisitaDoDia, OSs, FilaEspecialidade, distribuição      | N/A (domínio core) |
| **Triagem**                     | Triagem inicial, autenticação, geração do PlanoDeAtendimentos   | Partnership        |
| **Atendimento Especialista**    | Execução da OS e coleta da ProvaDeAtendimento                   | Partnership        |
| **Painéis & Notificações**      | Projeções em tempo real para pacientes, profissionais e público | Read Models (CQRS) |
| **Integrações**                 | Auth, Conecta Social, Terapias, Jurídico (futuros)              | ACL + PubLang      |

> **Nota**: A relação entre Core ↔ Integrações segue padrão *Anti‑corruption Layer (ACL)* com *Published Language*.

---

## 2. 🗣️ Linguagem Ubíqua (Glossário de Domínio)

| Termo                   | Definição                                                                             |                |                        |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------- | ---------------------- |
| **VisitaDoDia**         | Sessão de presença do paciente na unidade em um dia específico                        |                |                        |
| **PlanoDeAtendimentos** | Conjunto de **OS** derivadas da triagem, uma por especialidade                        |                |                        |
| **OS (OrdemDeServiço)** | Pedido de atendimento de uma especialidade para a VisitaDoDia                         |                |                        |
| **FilaEspecialidade**   | FIFO por especialidade contendo OSs `Prontas`                                         |                |                        |
| **FilaTriagem**         | FIFO independente de triagem assistencial (não autenticados)                          |                |                        |
| **CarryOver**           | OS não atendida no dia que ganha prioridade máxima na próxima visita                  |                |                        |
| **ProvaDeAtendimento**  | Evidência (foto de documento) obrigatória ao concluir uma OS                          |                |                        |
| **StatusOS**            | Ciclo de vida: `Criada → Pronta → Chamado → EmAtendimento → Concluída` + ramificações |                |                        |
| **StatusVisita**        | Ciclo da Visita: `EmAndamento                                                         | Concluída      | EncerradaPeloDia`      |
| **JanelaDeOperação**    | Seg–Sex, 08:00–17:00 (Fortaleza), agenda por especialidade                            |                |                        |
| **Profissional**        | Agente da execução da OS, associado a uma especialidade                               |                |                        |
| **PrioridadeOS**        | `Normal`                                                                              | `CarryOverMAX` | `CancelamentoPendente` |

---

## 3. 🧱 Agregados e Entidades

### 3.1 ✅ Agregado Raiz: `VisitaDoDia`

```ts
VisitaDoDia {
  id: IDVisita
  pacienteId: PacienteID
  data: LocalDate
  horaChegada: Instant
  status: EmAndamento | Concluída | EncerradaPeloDia
  flags: { temCarryOverPendentes: boolean }
  plano: OS[] // composição
}
```

**Invariantes**:

* Uma VisitaDoDia está ligada a **um paciente** e **um dia**.
* Cada OS pertence **exclusivamente** à sua VisitaDoDia.
* Uma OS não pode existir fora do escopo da Visita.

---

### 3.2 🧩 Entidade: `OrdemDeServiço (OS)`

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

* `Pronta`: exige paciente autenticado, agenda ativa e dentro da janela.
* `Chamado`: feito por profissional da mesma especialidade com fila aberta (lock atômico).
* `Concluída`: exige ProvaDeAtendimento.
* Paciente pode ter N OSs simultaneamente, mas só 1 `EmAtendimento`.

---

### 3.3 🌀 Agregado: `FilaEspecialidade`

```ts
FilaEspecialidade {
  especialidadeId: EspecialidadeID
  fila: Queue<OSID> // apenas OSs "Prontas"
}
```

**Política de Consumo (Pull):**

1. Prioridade: `CarryOverMAX` > `Normal`
2. Dentro da mesma prioridade: FIFO (ordem de chegada da Visita)
3. Só é elegível se paciente **não está ocupado** em outra OS

---

### 3.4 👨‍⚕️ Entidade: `Profissional`

```ts
Profissional {
  id: ProfissionalID
  especialidadeId: EspecialidadeID
  filaAberta: boolean
  agenda: DiasHoras
  estado: Disponível | Ocupado
}
```

**Comportamento**:

* `AbrirFila`: permite chamar pacientes
* `ConcluirAtendimento`: permite nova chamada se fila aberta
* Vincula apenas OSs da sua especialidade

---

### 3.5 🧾 Agregado: `Triagem`

* FIFO de pacientes não-autenticados.
* Produz: `PlanoDeAtendimentos` ou status final (Encaminhado/Cancelado).

---

## 4. 🔄 Máquinas de Estado

### 4.1 OrdemDeServiço

```mermaid
stateDiagram-v2
  [*] --> Criada
  Criada --> Pronta: Janela ativa + paciente autenticado
  Pronta --> Chamado: reserva atômica
  Chamado --> EmAtendimento: presença registrada
  EmAtendimento --> Concluída: prova anexada
  Pronta --> CarryOver: encerramento da especialidade
  Pronta --> CancelamentoPendente
  CancelamentoPendente --> Cancelada: social aprova
  Chamado --> NãoCompareceu: timeout
  [*] <-- Concluída
```

---

### 4.2 VisitaDoDia

```mermaid
stateDiagram-v2
  [*] --> EmAndamento
  EmAndamento --> Concluída: todas OSs finalizadas
  EmAndamento --> EncerradaPeloDia: fim do expediente
  [*] <-- Concluída
```

---

## 5. 📡 Eventos de Domínio

| Evento                      | Gatilho/Descrição             |
| --------------------------- | ----------------------------- |
| `PacienteChegou`            | Criação de nova VisitaDoDia   |
| `TriagemConcluida`          | OSs geradas                   |
| `OSProntaGerada`            | Pronta para fila              |
| `ProfissionalAbriuFila`     | Habilita `PegarProximo`       |
| `OSReservada`               | Puxada atômica                |
| `AtendimentoIniciado`       | Paciente presente             |
| `ProvaDeAtendimentoAnexada` | Evidência ao concluir         |
| `AtendimentoConcluido`      | Transição final               |
| `OSEntrouEmCarryOver`       | No encerramento do expediente |
| `CancelamentoSolicitado`    | Paciente inicia fluxo         |
| `CancelamentoAprovado`      | Social aprova                 |
| `NaoCompareceuRegistrado`   | Timeout                       |

---

## 6. 🔁 Políticas de Domínio (Sagas / Reações)

| Política            | Evento gatilho             | Ação                                    |
| ------------------- | -------------------------- | --------------------------------------- |
| `Distribuição`      | `AbriuFila` ou `Concluido` | Tenta `PegarProximo()` respeitando FIFO |
| `BusyPatientPolicy` | `OSReservada`              | Se já ocupado, pula e tenta próxima     |
| `EncerramentoDoDia` | `DiaEncerrado`             | OS → `CarryOver`, Visita → `Encerrada`  |

---

## 7. 📊 Projeções (Read Models)

### 7.1 Painel Público (por Especialidade)

* Em Atendimento (X)
* Próximos 2 (ticket/iniciais)
* Em Fila: contagem
* ETA estimado (configurável: média/mediana)

### 7.2 Painel do Paciente

* Status por especialidade
* “Você é o próximo?”
* Tempo de espera estimado

### 7.3 Dashboard do Profissional

* Próximo paciente
* Lista curta
* Ações: Iniciar, Concluir, Anexar, FecharFila

---

## 8. 📌 Regras de Negócio

| #   | Regra                                                               |
| --- | ------------------------------------------------------------------- |
| R1  | FIFO por especialidade derivado da ordem de chegada                 |
| R2  | Um paciente só pode estar `EmAtendimento` em uma OS                 |
| R3  | `CarryOverMAX` fura fila de prioridade `Normal`                     |
| R4  | Cancelamento requer aprovação via relatório                         |
| R5  | `NãoCompareceu`: ausência no chamado ou no dia                      |
| R6  | `Concluída` exige ProvaDeAtendimento                                |
| R7  | `PegarProximo` é atômico e lockado                                  |
| R8  | OSs só viram `Pronta` se janela e agenda forem válidas              |
| R9  | Paciente não pode estar simultaneamente em triagem e especialidades |
| R10 | Auditoria obrigatória de todos os eventos                           |

---

## 9. 📦 MVP do Domínio

✔️ **Incluído no primeiro release** (Nível 0 do roadmap):

* VisitaDoDia com múltiplas OS
* Fila por especialidade com reserva atômica
* Execução de OS com Prova
* Triagem separada
* CarryOver e Cancelamento mediado
* Eventos e Auditoria
* Painéis: público, paciente, profissional

---

## 10. 📌 Pendências e Decisões Futuras

| Tema                         | Situação                        |
| ---------------------------- | ------------------------------- |
| Timeout do `Chamado`         | Definir tempo em minutos        |
| Paciente ocupado → fila      | Manter posição ou reordenar?    |
| Ordem interna das OS         | Aleatória ou sugerida?          |
| ETA: como calcular?          | Média, mediana, percentil?      |
| Tamanho/quantidade de provas | Restringir via política?        |
| Política de notificação      | Janela silenciosa? Confirmação? |

---

## 📚 Referências

* Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software*
* Vaughn Vernon, *Implementing Domain-Driven Design*
* Jeff Patton, *User Story Mapping*
* Lean UX – Jeff Gothelf & Josh Seiden
* Observability Engineering – Charity Majors, Liz Fong-Jones, George Miranda

---