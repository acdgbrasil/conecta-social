# 📘 Documento Conciso de Domínio — Sistema ACDG (Gestão de Filas + Triagem)

Documento condensado do domínio do **Sistema ACDG**, integrando Filas, Triagem, Atendimento, Painéis e Integrações, com referências ao sistema externo **Conecta Raros** (Conecta Social + BI).

> Implementação direta destes bounded contexts vive em `packages/acdg/<contexto>`, cada um com subpastas por linguagem (ex.: `orquestration_queue_context/dotnet`).

---

## 1. Visão Estratégica

- **Propósito do Sistema ACDG**  
  Orquestrar atendimentos presenciais na unidade ACDG **por ordem de chegada**, maximizando o uso dos profissionais de múltiplas especialidades, reduzindo tempo ocioso e garantindo auditoria completa de presença, faltas e cancelamentos.:contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

- **Problema que resolve**
  - Hoje a clínica tem vários profissionais, agendas e especialidades → o paciente se perde entre filas e portas.
  - Queremos uma **fila única lógica**, que distribui o paciente para as especialidades certas, com prioridade para quem “ficou devendo” (carryover) e controle social sobre cancelamentos.

- **Objetivos estratégicos**
  - Garantir que o paciente **faça o máximo de atendimentos possíveis** na sua ida do dia.
  - **Evitar buracos na agenda** dos profissionais.
  - Manter trilha de **auditoria legal e social** (presenças, faltas, cancelamentos, justificativas).
  - Ter **painéis claros** para paciente, profissional e gestão.

- **Perfis de usuário**
  - Paciente (não autenticado → em triagem; autenticado → em filas de especialidade).
  - Assistente social (Triagem Social ACDG).
  - Profissional de especialidade (psico, fisio, etc.).
  - Gestor/coordenador da unidade.
  - Administrador de sistemas / auditor.

- **Escopo de MVP (domínio):contentReference[oaicite:2]{index=2}**
  - VisitaDoDia com múltiplas OS (uma por especialidade).
  - Filas por especialidade com **reserva atômica** (`PegarProximo`).
  - Execução da OS com **ProvaDeAtendimento** obrigatória.
  - Triagem separada que gera PlanoDeAtendimentos.
  - CarryOver e Cancelamento mediado pela triagem social.
  - Eventos de domínio e trilha de auditoria.
  - Painéis: público, paciente, profissional, gestão.

- **Tecnologia / Arquitetura (esperada)**
  - Backend ACDG em .NET / C# (ou similar), com **camada de domínio pura**.
  - CQRS: comandos atualizam domínio; **read models** para painéis.:contentReference[oaicite:3]{index=3}
  - Integrações com Conecta Raros, Auth, Storage, Notificações via ACL.

---

## 2. Context Map e Status (Sistema ACDG + Conecta Raros)

### 2.1 Bounded Contexts do Sistema ACDG:contentReference[oaicite:4]{index=4}

- **Filas & Orquestração (Core Domain)**  
  Coordena `VisitaDoDia`, `OS`, `FilaEspecialidade`, CarryOver, cancelamentos, faltas.

- **Triagem Social ACDG (Supporting)**  
  - `FilaTriagem` de não-autenticados.  
  - Gera `PlanoDeAtendimentosACDG`.  
  - Media `CancelamentoAprovado` / faltas justificadas.

- **Atendimento Especialista (Supporting)**  
  - Profissional abre/fecha fila, chama próximo, registra presença, anexa prova, conclui OS.

- **Painéis & Notificações (Generic / Read Models)**  
  - Painel público (TV por especialidade).  
  - Painel do paciente (posição, “você é o próximo?”, ETA).  
  - Painel do profissional.  
  - Painel de gestão.

- **Integrações (Generic / ACL + PubLang)**  
  - Ponte do Sistema ACDG com sistemas externos (Conecta Raros, Auth, Storage, Notificações).

- **Terapias (futuro, Core/Supporting interno ACDG)**  
  - Domínio clínico terapêutico: conteúdo das sessões.

- **Jurídico (futuro, Core/Supporting interno ACDG)**  
  - Domínio jurídico: casos, orientações, prazos.

- **People Context (interno ACDG)**  
  - Cadastro de pessoas relacionadas à ACDG (profissionais, possivelmente pacientes) com `personId` e dados básicos.

### 2.2 Sistema Conecta Raros (externo)

- **Conecta Social (Social Care Context — Core)**  
  - Agregado `Patient` como prontuário social: diagnósticos, família, encaminhamentos, violações, narrativas.:contentReference[oaicite:5]{index=5}

- **Analysis & Research / BI**  
  - Consome eventos (incluindo futuramente do ACDG) para relatórios e pesquisa, com anonimização.:contentReference[oaicite:6]{index=6}

- **Format Conversions & Forms**  
  - Geração/baixa de formulários/relatórios em formatos específicos (PDF, etc.).

---

## 3. Bounded Contexts (resumo 1 por 1)

### 3.1 Filas & Orquestração (Core ACDG):contentReference[oaicite:7]{index=7}

- **Aggregates principais**
  - `VisitaDoDia` — presença do paciente em um dia, com todas as OS.
  - `OS (OrdemDeServiço)` — atendimento por especialidade na visita.
  - `FilaEspecialidade` — fila lógica de OS `Prontas` da especialidade.
  - `Profissional` (visão filas) — estado de fila aberta/fechada, disponibilidade.

- **Regras chave**
  - R1: FIFO por especialidade (ordem de chegada).:contentReference[oaicite:8]{index=8}
  - R2: paciente só pode estar `EmAtendimento` em **uma OS** por vez.:contentReference[oaicite:9]{index=9}
  - R3: `CarryOverMAX` fura fila de prioridade `Normal`.:contentReference[oaicite:10]{index=10}
  - R4: cancelamento requer aprovação social (Triagem).:contentReference[oaicite:11]{index=11}
  - R5: `NãoCompareceu` = ausência no chamado ou no dia.  
  - R6: `Concluída` exige `ProvaDeAtendimento`.:contentReference[oaicite:12]{index=12}
  - R7: `PegarProximo` é atômico/lockado.  
  - R8: OS só vira `Pronta` se janela de operação/agenda válidas.:contentReference[oaicite:13]{index=13}
  - R9: paciente não pode estar simultaneamente em Triagem e Especialidades.:contentReference[oaicite:14]{index=14}

- **Eventos principais:contentReference[oaicite:15]{index=15}**
  - `PacienteChegou`, `TriagemConcluida`, `OSProntaGerada`, `ProfissionalAbriuFila`,
  - `OSReservada`, `AtendimentoIniciado`, `ProvaDeAtendimentoAnexada`,
  - `AtendimentoConcluido`, `OSEntrouEmCarryOver`, `CancelamentoSolicitado`, `CancelamentoAprovado`, `NaoCompareceuRegistrado`.

---

### 3.2 Triagem Social ACDG

- **Responsável por**
  - Fila de **não-autenticados** (`FilaTriagem`).
  - Conduzir triagem social usando o `Patient` do Conecta Social (via Integrações).
  - Criar/atualizar `PlanoDeAtendimentosACDG` (quais especialidades, quais dias).
  - Mediar **cancelamentos** → decidir `CancelamentoAprovado` ou não.

- **Conecta Raros (Conecta Social)**
  - Triagem sempre passa por métodos públicos de `Patient` (`createFromScratch`, `registerAppointment`, `createReferral`, etc.), mantendo invariantes sociais.:contentReference[oaicite:16]{index=16}

---

### 3.3 Atendimento Especialista

- **Responsável por**
  - Workflow do profissional:
    - `AbrirFila` → `ProfissionalAbriuFila`.
    - `PegarProximo` (pede para Filas).
    - `RegistrarPresenca` → `AtendimentoIniciado`.
    - `AnexarProvaDeAtendimento`.
    - `ConcluirAtendimento` → `AtendimentoConcluido`.

- **Regras**
  - Profissional só atende OS da **própria especialidade**.
  - Não pode ter duas OS `EmAtendimento` ao mesmo tempo.
  - Não conclui sem prova anexada.

---

### 3.4 Painéis & Notificações (Read Models)

- **Read models principais:contentReference[oaicite:17]{index=17}**
  - Painel Público (por especialidade):
    - Em atendimento (1), próximos 2, total em fila, ETA estimado.
  - Painel do Paciente:
    - status por especialidade, posição, “você é o próximo?”, ETA.
  - Dashboard do Profissional:
    - paciente em atendimento, próximos, total em fila, ações rápidas.
  - Painel de Gestão:
    - tempos médios de espera/atendimento, carryover, faltas, volume por especialidade/profissional.

- **Características**
  - Só leitura, consistência eventual.
  - Consome eventos de Filas + Triagem; não muda o domínio.

---

### 3.5 Integrações (ACDG ↔ mundo externo)

- **Com quem fala**
  - Sistema **Conecta Raros**:
    - Conecta Social (prontuário social).
    - Analysis & Research / BI (analytics).
    - Format Conversions & Forms (relatórios/formulários).
  - **Auth / Identity & Access** (SSO/permissões).
  - **Serviço de Notificações** (push/SMS/e-mail).
  - **Storage de Arquivos** (Provas).

- **Padrões**
  - ACL (tradução de modelos externos ↔ VO/DTO ACDG).:contentReference[oaicite:18]{index=18}
  - Published Language (eventos ACDG para BI/externos).:contentReference[oaicite:19]{index=19}
  - Open Host Service (Auth).
  - Shared Kernel opcional para tipos base (`Uuid`, `Result`, etc.).:contentReference[oaicite:20]{index=20}

---

## 4. Eventos do Sistema ACDG (resumo rápido)

| Evento                      | Origem principal       | Impacto chave                                            |
| --------------------------- | ---------------------- | -------------------------------------------------------- |
| `PacienteChegou`            | Filas                  | Cria `VisitaDoDia`, alimenta painéis                     |
| `TriagemConcluida`         | Triagem                | Gera plano → OSs por especialidade                      |
| `OSProntaGerada`            | Filas                  | OS entra na `FilaEspecialidade`                          |
| `ProfissionalAbriuFila`     | Atendimento Especialista | Dispara política de distribuição                         |
| `OSReservada`               | Filas                  | Paciente chamado (lock atômico na fila)                 |
| `AtendimentoIniciado`       | Atendimento Especialista | Marca presença, inicia sessão terapêutica/jurídica      |
| `ProvaDeAtendimentoAnexada` | Atendimento Especialista | Permite conclusão da OS                                 |
| `AtendimentoConcluido`      | Atendimento Especialista | Libera profissional e gera dado de presença para BI     |
| `OSEntrouEmCarryOver`       | Filas                  | OS sobe na prioridade para próximo dia                  |
| `CancelamentoSolicitado`    | Filas                  | Abre fluxo social de avaliação                          |
| `CancelamentoAprovado`      | Triagem                | Falta justificada, OS cancelada                         |
| `NaoCompareceuRegistrado`   | Filas                  | Falta não justificada, alimenta BI/Terapias/Jurídico    |

---

## 5. Glossário Essencial

> Baseado no glossário do domínio de filas.:contentReference[oaicite:21]{index=21}

| Termo                 | Definição                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| **VisitaDoDia**       | Sessão de presença do paciente na unidade em um dia específico.           |
| **OS (OrdemDeServiço)** | Pedido de atendimento de uma especialidade dentro da VisitaDoDia.       |
| **PlanoDeAtendimentosACDG** | Conjunto de especialidades/dias definidos pela Triagem ACDG para o paciente. |
| **FilaEspecialidade** | FIFO lógica por especialidade contendo OS `Prontas`.                      |
| **FilaTriagem**       | Fila FIFO de pessoas não-autenticadas que ainda não passaram pela triagem social. |
| **CarryOver**         | OS não atendida no dia; vai para o próximo dia com prioridade máxima.     |
| **ProvaDeAtendimento**| Evidência (foto/documento) obrigatória para concluir uma OS.              |
| **StatusOS**          | Estados da OS: `Criada`, `Pronta`, `Chamado`, `EmAtendimento`, `Concluída`, `CancelamentoPendente`, `Cancelada`, `CarryOver`, `NãoCompareceu`. |
| **StatusVisita**      | `EmAndamento`, `Concluída`, `EncerradaPeloDia`.                           |
| **Paciente autenticado** | Pessoa já triada, com PlanoAtendimentos ativo, apta a entrar em filas de especialidade. |
| **Triagem Social ACDG** | Atendimento social da unidade que decide plano de cuidado, cancelamentos e encaminhamentos. |
| **Sistema ACDG**      | Conjunto de BCs internos (Filas, Triagem, Atendimento, Painéis, Integrações, Terapias, Jurídico, People). |
* **Sistema Conecta Raros** | Sistema externo com Conecta Social (prontuário social), Analysis & Research (BI) e módulos de Form/Format Conversion. |

## 6. Referências Técnicas
Para detalhes de implementação, arquitetura Swift e guias de performance, consulte o [Codebase Guide: Queue Orchestration](../../codebase/acdg/queue-orquestration/documentation.md).

## 7. Integrações
Consulte o [Catálogo de Integrações](../../integration-catalog.md) para detalhes sobre ACLs e eventos.