# 📍 2. Mapa de Contexto — Sistema de Filas ACDG

## 🎯 Objetivo

Este capítulo responde:

- **Quais são os limites naturais do sistema de filas?**
- **Quais partes falam com quais?**
- **Onde estão as integrações externas (Conecta Social, Auth, etc.)?**
- **Quem depende de quem?**
- **Qual contexto é Core, qual é Supporting, qual é Generic?**

A partir do modelo de domínio já formalizado, refinamos os bounded contexts considerando também o Conecta Social (`Social Care Context`) e os contextos de identidade/cadastros.

---

## 🗺️ Visão Geral (Simplificada em Texto)

```plaintext
                       ┌───────────────────────────────────────┐
                       │              UI / Gateway             │
                       │  - Portal ACDG / App Paciente         │
                       │  - Painel Público da Unidade          │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
            ┌────────────────────────────────────────────────────┐
            │     ⭐ Filas & Orquestração Context (Core ACDG)    │
            │ - VisitaDoDia, OS, FilaEspecialidade              │
            │ - CarryOver, Cancelamentos, NãoCompareceu         │
            │ - Eventos + Projeções para painéis                │
            └─────────────┬───────────────────────┬─────────────┘
                          │                       │
                Upstream  │                       │  Comandos/Eventos
                          ▼                       ▼
        ┌───────────────────────────────┐   ┌───────────────────────────────┐
        │       Triagem Social Context  │   │   Atendimento Especialista    │
        │ - FilaTriagem (não aut.)      │   │ - AbrirFila / FecharFila     │
        │ - PlanoDeAtendimentos         │   │ - PegarProximo               │
        │ - Cancelamento justificado    │   │ - RegistrarPresenca + Prova  │
        └──────────────┬────────────────┘   └───────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │   Social Care Context (Conecta Social)   │
        │ - Patient, Referral, RightsViolation...  │
        └──────────────────────────────────────────┘

                       ▲
                       │
                       │ Eventos de domínio
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │        Painéis & Notificações Context    │
        │ - Painel Público por Especialidade       │
        │ - Painel do Paciente                     │
        │ - Dashboard do Profissional / Gestão     │
        └──────────────────────────────────────────┘

                       ▲
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │           Integrações Context            │
        │ - Auth / Identity & Access               │
        │ - People (cadastro de pessoas)           │
        │ - Conecta Terapias (futuro)              │
        │ - Conecta Jurídico (futuro)              │
        └──────────────────────────────────────────┘
````

---

## 2.1 Tabela de Bounded Contexts

Baseado no contexto original do domínio de filas, com refinamento da Triagem Social:

| Bounded Context                          | Responsabilidade principal                                                                   | Tipo de Domínio          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| **Filas & Orquestração (Core)**          | Coordena `VisitaDoDia`, `OS`, `FilaEspecialidade`, `CarryOver`, cancelamentos, faltas        | ⭐ Core Domain            |
| **Triagem Social**                       | Triagem inicial, autenticação social, gera/atualiza PlanoDeAtendimentos, media cancelamentos | Supporting (estratégico) |
| **Atendimento Especialista**             | Execução da OS (abrir/fechar fila, chamar paciente, registrar presença + prova)              | Supporting               |
| **Painéis & Notificações**               | Projeções em tempo real (público, paciente, profissional, gestão)                            | Generic (Read Models)    |
| **Integrações**                          | Auth, People, Conecta Social (eventos), Terapias e Jurídico (futuros)                        | Generic / ACL + PubLang  |
| **Social Care Context (Conecta Social)** | Prontuário social (`Patient`, `Referral`, `RightsViolationReport`, `SocialCareAppointment`)  | Core Domain (social)     |
| **Shared Kernel / Identity / People**    | `Result`, `DomainError`, `Uuid`, `PersonId`, permissões, cadastro de pessoas                 | Shared Kernel / Infra    |

> **Nota**: A relação entre Core ↔ Integrações segue padrão *Anti-corruption Layer (ACL)* com *Published Language*, como já documentado no modelo de filas.

---

## 2.2 Detalhes de cada Bounded Context

### 1. ⭐ Filas & Orquestração Context (Core Domain)

**Tipo**: Core Domain

**Responsável por:**

* Modelar a **presença diária** via `VisitaDoDia` (paciente + dia).
* Controlar o ciclo de vida das **OS (Ordens de Serviço)** por especialidade:

  * `Criada → Pronta → Chamado → EmAtendimento → Concluída`,
  * ramificações para `CarryOver`, `CancelamentoPendente`, `Cancelada`, `NãoCompareceu`.
* Manter a **FilaEspecialidade** para cada especialidade, com política:

  * Prioridade: `CarryOverMAX` > `Normal`
  * Dentro da mesma prioridade: FIFO (ordem de chegada da visita).
* Garantir invariantes críticos:

  * Um paciente pode ter N OS no dia, mas só 1 `EmAtendimento`.
  * OS só vira `Pronta` se paciente estiver autenticado e dentro da janela de operação.
  * `Concluída` exige `ProvaDeAtendimento`.
* Orquestrar **políticas de domínio** como:

  * `Distribuição` (chamar próximo quando a fila abre ou um atendimento conclui).
  * `BusyPatientPolicy` (pular temporariamente paciente ocupado).
  * `EncerramentoDoDia` (jogar OS para `CarryOver`, marcar Visita como `EncerradaPeloDia`).

**Interage com:**

* **Triagem Social** — recebe `TriagemConcluida` e `CancelamentoAprovado`.
* **Atendimento Especialista** — recebe comandos de `AbrirFila`, `PegarProximo`, `ConcluirAtendimento`.
* **Painéis & Notificações** — publica eventos para projeções.
* **Integrações** — emite eventos de presença/frequência para outros domínios.

---

### 2. 🧾 Triagem Social Context

> “FilaTriagem + Conecta Social” visto a partir da unidade ACDG.

**Tipo**: Supporting Domain (estratégico)

**Responsável por:**

* Operar a **FilaTriagem** de pacientes não autenticados:

  * FIFO simples de pessoas que chegaram à unidade, mas ainda não têm Plano de Atendimentos.
* Conduzir **triagem social** usando o `Social Care Context`:

  * `Patient` como agregado raiz do prontuário social.
  * VO’s como `Diagnosis`, `HousingCondition`, `SocialHealthSummary`, `PersonId` etc..
* Definir o **PlanoDeAtendimentos**:

  * Quais especialidades o paciente precisa.
  * Em quais dias deve comparecer à unidade.
* Mediar **cancelamentos**:

  * Analisar pedido do paciente.
  * Registrar `SocialCareAppointment` / `Referral` se necessário.
  * Publicar `CancelamentoAprovado` para o contexto de filas.

**Eventos chave publicados para Filas:**

* `TriagemConcluida` → gera OSs iniciais para a visita.
* `PlanoDeAtendimentosAtualizado` (futuro).
* `CancelamentoAprovado` → permite remover OS da fila com falta justificada.

**Dependências:**

* **Social Care Context (Conecta Social)** como core domain por trás da triagem.
* **People Context** e **Identity & Access** para identificar pessoas e validar permissões do assistente social.

---

### 3. 👨‍⚕️ Atendimento Especialista Context

**Tipo**: Supporting Domain

**Responsável por:**

* Modelar o **Profissional** e sua relação com filas:

  * `id`, `especialidadeId`, `filaAberta`, `agenda`, `estado`.
* Expôr comandos de alto nível:

  * `AbrirFila` — indica que está disponível para receber pacientes.
  * `PegarProximo` — dispara reserva atômica da próxima OS da especialidade.
  * `RegistrarPresenca` — confirma que o paciente está na sala, muda OS para `EmAtendimento`.
  * `AnexarProvaDeAtendimento` — envia prova exigida para conclusão.
  * `ConcluirAtendimento` — marca OS como `Concluída`, libera profissional para novo atendimento.
  * `FecharFila` — encerra a fila para aquele profissional.

**Interação com Filas (Core):**

* É cliente privilegiado da API de filas:

  * pede `PegarProximo` na `FilaEspecialidade`.
  * dispara eventos `AtendimentoIniciado`, `ProvaDeAtendimentoAnexada`, `AtendimentoConcluido`.

---

### 4. 📊 Painéis & Notificações Context

**Tipo**: Generic Domain (Read Models / CQRS)

**Responsável por:**

* Consumir **eventos do domínio de Filas** e projetar em modelos de leitura otimizados:

  * **Painel Público por Especialidade**:

    * Em Atendimento (1)
    * Próximos 2 da fila (ticket/iniciais)
    * Contagem de pessoas em fila
    * ETA estimado (média/mediana configurável)

  * **Painel do Paciente**:

    * Status por especialidade
    * “Você é o próximo?”
    * Tempo de espera estimado

  * **Dashboard do Profissional**:

    * Próximo paciente
    * Lista curta da fila
    * Ações rápidas (Iniciar, Concluir, Anexar, FecharFila)

  * **Painel da Gestão / Administração**:

    * Indicadores agregados por dia, especialidade, profissional (espera, carryover, faltas).

**Características:**

* Não aplica regras de negócio (não decide nada), apenas **reflete o estado**.
* Pode usar bancos e tecnologias voltadas a leitura (cache, projs incrementais etc.).
* Permite evoluir visualizações sem tocar o Core.

---

### 5. 🔌 Integrações Context

**Tipo**: Generic / Integration + ACL

**Responsável por:**

* Servir de “casca” de integração entre o domínio de filas e:

  * **Auth / Identity & Access Context** — para autenticar pacientes e profissionais, e validar permissões antes de ações críticas.
  * **People Context** — cadastro de pessoas, garantindo existência e dados básicos de identificação.
  * **Conecta Social (Social Care Context)** — para acessar prontuário social (`Patient`) e publicar eventos para Analysis & Research.
  * **Conecta Terapias** (futuro) — detalhamento terapêutico, integrando com ciclo da OS.
  * **Conecta Jurídico** (futuro) — atendimentos jurídicos reutilizando infraestrutura de filas.

* Implementar padrões:

  * **ACL** (Anti-corruption Layer) para isolar modelos externos e traduzir para a linguagem de filas.
  * **Published Language** para eventos de domínio publicados e consumidos com contrato estável.

---

## 2.3 Tipos de Relacionamento entre Contextos

Tabela resumindo relações, inspirada no `context-map` do Conecta Social:

| De → Para                           | Tipo de relação                     | Descrição                                                                        |
| ----------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| UI / Gateway → Filas & Orquestração | Cliente API / Open Host Service     | UI envia comandos (entrar na fila, cancelar, visualizar status).                 |
| Triagem Social → Filas              | Upstream / Published Language       | Triagem publica `TriagemConcluida`, `CancelamentoAprovado`.                      |
| Filas → Triagem Social              | Event consumer / Notificação        | Filas podem notificar Triagem sobre faltas recorrentes (opcional).               |
| Atendimento Especialista → Filas    | Cliente API + eventos               | Profissional envia comandos (`AbrirFila`, `ConcluirAtendimento`) e gera eventos. |
| Filas → Painéis & Notificações      | Event-driven / Read Models          | Eventos de domínio alimentam projeções de painel.                                |
| Filas → Integrações                 | Published Language → ACL            | Publica eventos de presença/frequência; Integrações traduzem para externos.      |
| Integrações → Auth / People         | Cliente API / ACL                   | Consulta identidade e cadastro de pessoas.                                       |
| Triagem Social → Social Care        | Cliente de Core Domain              | Triagem usa diretamente `Patient` e VOs do Social Care Context.                  |
| Social Care → Analysis & Research   | Published Language + ACL consumidor | Social Care publica eventos anonimizados para análise.                           |

---

## 2.4 Resumo para “colar na parede”

* **Filas & Orquestração é o coração**: tudo gira em torno de `VisitaDoDia`, `OS` e `FilaEspecialidade`.
* **Triagem Social decide quem entra e com qual plano**; Filas só executa a logística do dia.
* **Atendimento Especialista** executa OS, mas não controla filas diretamente — sempre passa pelo Core.
* **Painéis** são projeções: podem mudar de tecnologia/forma sem mexer no domínio.
* **Integrações** protegem o modelo de filas das mudanças em Auth, People, Conecta Social, Terapias, Jurídico.
* **Conecta Social** continua sendo o **core domain do mundo social**; aqui ele aparece como upstream para Triagem e como fonte de verdade do prontuário.

---