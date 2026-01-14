* **Tabela 1** – Eventos principais do **Sistema ACDG** × **quem produz/consome dentro do ACDG**
* **Tabela 2** – Mesmos eventos × **quem consome fora (Sistema Conecta Raros + outros externos)**
* Legenda:

  * **P** = produz
  * **C** = consome
  * **(futuro)** = uso planejado, não obrigatório no MVP

---

## 🧩 Tabela 1 — Eventos do Sistema ACDG × Bounded Contexts internos

**Colunas (BC internos do Sistema ACDG)**

* **FILA** = Filas & Orquestração (Core)
* **TRIA** = Triagem Social (ACDG)
* **ATESP** = Atendimento Especialista
* **PAIN** = Painéis & Notificações
* **TERA** = Terapias (futuro)
* **JUR** = Jurídico (futuro)
* **INT** = Integrações (só como “roteador” se precisar)

---

### 1) Eventos de Entrada / Triagem / Plano

| Evento                     | Descrição rápida                                | FILA | TRIA | ATESP | PAIN | TERA | JUR | INT |
| -------------------------- | ----------------------------------------------- | :--: | :--: | :---: | :--: | :--: | :-: | :-: |
| **PacienteChegou**         | Check-in na unidade, cria `VisitaDoDia`         |   P  |  C?* |       |   C  |  (C) | (C) |  C  |
| **TriagemConcluida**       | Triagem define/atualiza PlanoDeAtendimentosACDG |   C  |   P  |       |   C  |  (C) | (C) |  C  |
| **PlanoDeAtendAtualizado** | Ajuste de plano (especialidades/dias)           |   C  |   P  |       |   C  |  (C) | (C) |  C  |

> `PacienteChegou`: Triagem pode ouvir só para saber que alguém chegou “fora de plano” e precisa ir pra FilaTriagem (dependendo de como você implementar o fluxo).

---

### 2) Eventos de Fila / Orquestração

| Evento                    | Descrição rápida                               | FILA | TRIA | ATESP | PAIN | TERA | JUR | INT |
| ------------------------- | ---------------------------------------------- | :--: | :--: | :---: | :--: | :--: | :-: | :-: |
| **OSProntaGerada**        | OS entrou em estado `Pronta` e foi enfileirada |   P  |      |   C?  |   C  |  (C) | (C) |  C  |
| **ProfissionalAbriuFila** | Profissional ficou disponível                  |   C  |      |   P   |   C  |      |     |     |
| **OSReservada**           | OS chamada para um profissional (`Chamado`)    |   P  |      |   C   |   C  |      |     |  C  |

> ATESP pode consumir `OSProntaGerada` se você quiser mostrar a fila na UI antes mesmo de chamar o próximo.

---

### 3) Eventos de Execução do Atendimento

| Evento                   | Descrição rápida                          | FILA | TRIA | ATESP | PAIN |    TERA    |     JUR    | INT |
| ------------------------ | ----------------------------------------- | :--: | :--: | :---: | :--: | :--------: | :--------: | :-: |
| **AtendimentoIniciado**  | Presença registrada; OS → `EmAtendimento` |   P  |      |   C   |   C  | C (sessão) | C (sessão) |  C  |
| **ProvaDeAtendAnexada**  | ProvaDeAtendimento anexada na OS          |   P  |      |   C   |   C  | (C p/ doc) | (C p/ doc) |  C  |
| **AtendimentoConcluido** | OS → `Concluída`                          |   P  |      |   C   |   C  |      C     |      C     |  C  |

* **Terapias**: usa `AtendimentoIniciado/Concluido` para abrir/fechar sessão terapêutica.
* **Jurídico**: idem, para atendimentos jurídicos.

---

### 4) Eventos de Faltas / Cancelamentos

| Evento                      | Descrição rápida                                      | FILA |    TRIA   | ATESP | PAIN | TERA | JUR | INT |
| --------------------------- | ----------------------------------------------------- | :--: | :-------: | :---: | :--: | :--: | :-: | :-: |
| **CancelamentoSolicitado**  | Paciente pede para sair de um atendimento             |   P  |     C     |   C?  |   C  |      |     |  C  |
| **CancelamentoAprovado**    | Triagem/social aprova cancelamento, falta justificada |   C  |     P     |   C   |   C  |  (C) | (C) |  C  |
| **NaoCompareceuRegistrado** | Timeout ou falta registrada (não compareceu)          |   P  | C (casos) |   C   |   C  |   C  |  C  |  C  |

* **Triagem** pode usar `NaoCompareceuRegistrado` para identificar casos de abandono e reavaliar socialmente.
* **Terapias/Jurídico** usam faltas para seus próprios indicadores e decisões de caso.

---

### 5) Eventos de Encerramento / CarryOver

| Evento                  | Descrição rápida                                      | FILA | TRIA | ATESP | PAIN | TERA | JUR | INT |
| ----------------------- | ----------------------------------------------------- | :--: | :--: | :---: | :--: | :--: | :-: | :-: |
| **OSEntrouEmCarryOver** | OS `Pronta` não atendida, empurrada pro próximo dia   |   P  |  C?  |       |   C  |   C  |  C  |  C  |
| **DiaEncerrado**        | Evento de infra/sistema: fim do expediente da unidade |   C  |      |   C?  |   C  |      |     |  P  |

* `DiaEncerrado` normalmente é disparado por um scheduler ou operador (via Integrações / infra) → Filas dispara `EncerramentoDoDia` internamente.

---

## 🌐 Tabela 2 — Eventos do Sistema ACDG × Sistemas Externos

**Colunas (externos)**

* **SOC** = Conecta Social (Social Care Context)
* **BI** = Analysis & Research / BI (Conecta Raros)
* **FMT** = Format Conversions / Forms (Conecta Raros)
* **AUTH** = Auth / Identity & Access
* **NOTI** = Serviço de Notificações
* **STOR** = Storage de Arquivos

> Lembrando: consumos externos quase sempre passam **via Integrações Context**, não direto.

---

### 1) Eventos que interessam principalmente a BI / Analytics

| Evento                      |  SOC |  BI | FMT | AUTH | NOTI | STOR |
| --------------------------- | :--: | :-: | :-: | :--: | :--: | :--: |
| **PacienteChegou**          |      |  C  |     |      |      |      |
| **TriagemConcluida**        | (C)* |  C  | (C) |      |      |      |
| **PlanoDeAtendAtualizado**  | (C)* |  C  | (C) |      |      |      |
| **AtendimentoIniciado**     |      |  C  |     |      |      |      |
| **AtendimentoConcluido**    |      |  C  | (C) |      |      |      |
| **NaoCompareceuRegistrado** |      |  C  |     |      |      |      |
| **OSEntrouEmCarryOver**     |      |  C  |     |      |      |      |

* `SOC` (Conecta Social) não precisa necessariamente ouvir direto esses eventos — quem geralmente ouve é o **Analysis & Research** dentro do Conecta Raros.
  Mas, se em algum momento você quiser que o prontuário social seja enriquecido com info de presença, dá pra encaminhar alguns via BI ou outra ponte.

---

### 2) Eventos que acionam Notificações / UX

| Evento                   | SOC |  BI | FMT | AUTH | NOTI | STOR |
| ------------------------ | :-: | :-: | :-: | :--: | :--: | :--: |
| **OSReservada**          |     |     |     |      |   C  |      |
| **AtendimentoIniciado**  |     |     |     |      |   C  |      |
| **OSEntrouEmCarryOver**  |     |  C  |     |      |   C  |      |
| **CancelamentoAprovado** |     |  C  |     |      |   C  |      |

Exemplos:

* Quando uma OS é **Reservada** → Integrações pode disparar push “estão te chamando em X”.
* Quando entra em **CarryOver** → “sua consulta de X ficou para amanhã, com prioridade máxima”.

---

### 3) Eventos ligados a Storage / Forms

| Evento                   | SOC |  BI | FMT | AUTH | NOTI | STOR |
| ------------------------ | :-: | :-: | :-: | :--: | :--: | :--: |
| **ProvaDeAtendAnexada**  |     |  C? | (C) |      |      |   C  |
| **AtendimentoConcluido** |     |  C  |  C  |      |      |      |

* `ProvaDeAtendAnexada` → Integrações manda o arquivo pro **STOR** e guarda apenas o handle no domínio.
* `AtendimentoConcluido` + BI/FMT → podem gerar relatórios consolidados, PDFs, etc.

---

## Como usar essa matriz na prática

* Para **design de APIs/eventos**:

  * cada linha da matriz é um evento que você pode transformar em classe (C#) ou mensagem (Kafka, Rabbit, etc.),
  * as colunas ajudam a ver **quem precisa ouvir** esse evento de verdade (e onde não vale a pena enviar).

* Para **definir responsabilidades de time**:

  * BC internos do ACDG (Filas, Triagem, Terapias, Jurídico, Painéis) podem ser squads diferentes,
  * Integrações coordena a parte “para fora” (Conecta Raros, Auth, Notificações, Storage, BI).

* Para **evolução futura**:

  * quando Terapias e Jurídico forem implementados, você já sabe de cara quais eventos eles devem escutar (`AtendimentoIniciado`, `AtendimentoConcluido`, `NaoCompareceuRegistrado`, `OSEntrouEmCarryOver`, etc.),
  * você também consegue enxergar onde podem surgir novos eventos sem quebrar contratos atuais (ex.: `CasoJuridicoCriado`, mas só dentro do sistema ACDG).
