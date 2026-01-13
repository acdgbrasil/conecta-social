# 📘 Introdução — Sistema de Gestão de Filas ACDG

**Documento**: `queue_manager_introduction.md`  
**Versão**: 0.1  
**Domínio**: Gestão de Filas da unidade ACDG  
**Focado em**: Gestores, produto, equipe assistencial e social

---

## 1. Por que a ACDG precisa de um Sistema de Filas?

A ACDG é uma unidade física única, com vários profissionais atuando em **múltiplas especialidades** (psicologia, fisioterapia, etc.), em dias e horários diferentes.

Na prática:

- Uma mesma pessoa costuma precisar de **mais de um atendimento no mesmo dia** (ex.: triagem social + psicologia + fisioterapia).
- Cada profissional tem **sua agenda própria** e abre/fecha sua “porta” de atendimento conforme seu horário.
- Sem um orquestrador, é muito fácil acontecer:
  - Paciente perdido (“já fui atendido aqui, vou pra onde agora?”).
  - Profissional ocioso com sala vazia enquanto existem pessoas esperando por aquela especialidade.
  - Pacientes indo embora sem completar todos os atendimentos previstos.
  - Dificuldade para explicar, em auditoria, **quem foi atendido, quem faltou e por quê**.

O **Sistema de Gestão de Filas** nasce justamente para resolver isso:  
organizar o dia da unidade **por ordem de chegada**, garantir que cada pessoa seja atendida no **máximo de especialidades possíveis** que estão previstas para ela e deixar tudo **auditável**.

---

## 2. O que o sistema faz, em uma frase?

> Orquestra os atendimentos presenciais por ordem de chegada,  
> coordenando várias especialidades ao longo do dia,  
> com **fila única por especialidade**, atendida por 1..N profissionais,  
> garantindo fluidez para o paciente e uso eficiente do tempo dos profissionais.

---

## 3. Quem são os “clientes” desse sistema?

### 3.1 Paciente não autenticado (pré-triagem)

- Pessoa que **chegou na unidade**, mas ainda não passou pela triagem social.
- Entra na **Fila de Triagem** (uma fila simples, por ordem de chegada).
- Ainda não pode ir para as filas das especialidades.

### 3.2 Paciente autenticado (já passou pela triagem)

- Já foi avaliado pela equipe social e tem um **Plano de Atendimentos** (quais especialidades deve fazer).
- A cada dia em que comparece, é registrada uma **Visita do Dia**, e o sistema cria as “pedrinhas” de atendimento (OS) que ele deve fazer naquele dia.

### 3.3 Assistente Social / Equipe de Triagem

- Atende a **Fila de Triagem** (pacientes não autenticados).
- Define se a pessoa será atendida na ACDG, quais especialidades precisa e com que frequência (Plano de Atendimentos).
- É quem **aprova ou não** pedidos de cancelamento de atendimento, registrando justificativa social (falta justificada).

### 3.4 Profissional de Especialidade

- Psicólogo, fisioterapeuta, terapeuta, etc.
- **Abre e fecha sua fila** de atendimento, sempre dentro da sua especialidade.
- Quando a fila está aberta, o sistema entrega o **próximo paciente elegível** daquela especialidade.
- Ao terminar, registra presença e **anexa uma prova de atendimento** (foto de documento assinado).

### 3.5 Coordenação / Gestão da Unidade

- Precisa enxergar em tempo quase real:
  - Quantas pessoas estão em fila por especialidade.
  - Quantos atendimentos foram concluídos no dia.
  - Quantas faltas e quantos casos ficaram para o dia seguinte (carryover).
- Usa esses dados para ajustar escala de profissionais, políticas de atendimento e prestação de contas para parceiros e financiadores.

### 3.6 Administração / Auditoria

- Usa o sistema como **fonte oficial** para responder:
  - Quem foi chamado, quando e por quem?
  - Houve falta justificada ou não justificada?
  - Quantos atendimentos cada profissional realizou?
- O domínio foi pensado para que **todo evento relevante fique registrado**: chegada, triagem, chamadas, presenças, faltas, cancelamentos, carryover, etc.

---

## 4. Como funciona o fluxo do dia na prática?

### 4.1 Chegada e Triagem Social

1. A pessoa chega à unidade.  
2. Se ainda não tem triagem, entra na **Fila de Triagem Social** (uma fila simples, sem prioridade).  
3. O assistente social atende, avalia o caso usando o prontuário social (`Patient` no Conecta Social) e decide:
   - se o caso é elegível para a ACDG,
   - quais especialidades são necessárias,
   - em quais dias deve comparecer.
4. Ao finalizar a triagem, o sistema cria um **Plano de Atendimentos**: uma lista de especialidades que essa pessoa deverá cumprir na unidade.

> A partir daqui, a pessoa vira um **paciente autenticado** para o contexto de filas.

### 4.2 Visita do Dia e geração de atendimentos (OS)

Quando o paciente comparece em um dia válido:

1. É registrada uma **Visita do Dia** com data, hora de chegada e vínculo ao paciente.  
2. Para aquele dia, o sistema avalia o Plano de Atendimentos e gera uma ou mais **Ordens de Serviço (OS)** — uma para cada especialidade que deve ser atendida.  
3. Cada OS pode seguir estes estados principais:
   - `Criada → Pronta → Chamado → EmAtendimento → Concluída`,  
   - com ramificações para `CarryOver`, `CancelamentoPendente`, `Cancelada`, `NãoCompareceu`.

### 4.3 Filas por Especialidade

- Para cada especialidade, há uma **FilaEspecialidade** com as OS que estão `Prontas` para serem atendidas.
- A fila respeita:
  1. Prioridade:  
     - OS que vieram de **carryover** (não atendidas no dia anterior) entram com prioridade máxima (`CarryOverMAX`).
  2. Dentro da mesma prioridade:  
     - a ordem é **FIFO** (ordem de chegada do paciente na unidade).
- Um paciente pode ter **várias OS no mesmo dia**, mas só pode estar **em atendimento em uma de cada vez**.

Quando um profissional de uma especialidade:

- **Abre sua fila**, o sistema tenta entregar o **próximo paciente elegível** daquela fila (`PegarProximo`).
- Se o paciente já está em atendimento em outra especialidade, o sistema respeita a política de **pular temporariamente** e tentar o próximo (BusyPatientPolicy).

### 4.4 Encerramento do dia e CarryOver

Quando o expediente da unidade termina (por exemplo, às 17h):

- As OS que ainda estavam `Prontas` e não foram atendidas vão para **CarryOver**.
- Na próxima visita da pessoa, essas OS voltam com **prioridade máxima** na fila da especialidade correspondente.

---

## 5. Como o sistema lida com cancelamentos, faltas e justificativas?

### 5.1 Cancelamento iniciado pelo paciente

- O paciente pode pedir para **sair de um atendimento** (não quer mais aquela especialidade ou não pode ficar).
- O sistema **não remove imediatamente** a OS da fila:
  - a OS entra em um estado de **CancelamentoPendente**, com prioridade baixa.
- Isso dispara uma tarefa para a **Equipe Social**, que deverá:
  - conversar com o paciente,
  - registrar o atendimento social no prontuário (`SocialCareAppointment`),
  - decidir se aprova ou não esse cancelamento.

> Só depois que a Equipe Social aprovar, o sistema marca a OS como **Cancelada** e registra a falta como **justificada**.

### 5.2 Não comparecimento

- Se o paciente é chamado e não aparece dentro de um tempo definido, o sistema registra **NãoCompareceu**:
  - a OS passa para estado de `NãoCompareceu`,
  - conta como **falta não justificada**.

Isso permite:

- diferenciar claramente **faltas justificadas** (com relatório social) de faltas **não justificadas**,
- gerar relatórios confiáveis de presença, adesão ao tratamento e uso da unidade.

---

## 6. O que está dentro do MVP do sistema de filas?

### 6.1 Incluído no primeiro release

De forma simplificada, o MVP do domínio de filas inclui:

- **Visita do Dia** com múltiplas OS (uma por especialidade).
- **Fila por especialidade** com reserva atômica:
  - `PegarProximo` garante que dois profissionais não puxem a mesma OS ao mesmo tempo.
- Execução da OS com:
  - registro de presença,
  - **Prova de Atendimento obrigatória** para concluir (foto/documento anexado).
- **Triagem separada**:
  - Fila de Triagem para não-autenticados,
  - Geração do Plano de Atendimentos pela equipe social.
- **CarryOver** e cancelamento mediado pela Equipe Social.
- Registro de eventos para **auditoria completa**.
- **Painéis**:
  - Painel público por especialidade (quem está sendo atendido, próximos da fila, total em fila, ETA).
  - Painel do paciente (posição nas filas e “você é o próximo?”).
  - Dashboard do profissional (próximo paciente, ações rápidas).

### 6.2 Fora do escopo imediato (planejado para depois)

- Sistema formal de **agendamentos por horário** (agenda médica completa).
- Regras de **pagamento/convênio**.
- Relatórios analíticos sofisticados (BI avançado).
- Múltiplas unidades físicas (por enquanto o desenho assume **uma unidade ACDG**).

---

## 7. Quais são as principais métricas que o gestor pode acompanhar?

O domínio já nasce preparado para permitir relatórios como:

- ⏱️ **Tempo médio de espera por especialidade**  
  - da OS ficar `Pronta` até entrar `EmAtendimento`.

- ✅ **Taxa de conclusão do Plano de Atendimentos no dia**  
  - quantos pacientes conseguem finalizar todas as OS previstas durante a Visita do Dia.

- 🔁 **Taxa de CarryOver**  
  - quantas OS precisam ser empurradas para o dia seguinte, por especialidade.

- 🚫 **Taxa de faltas (justificadas x não justificadas)**  
  - quantas vezes o paciente não compareceu ao ser chamado,
  - quantas saídas foram aprovadas pelo Social x não justificadas.

- 👩‍⚕️ **Produtividade por profissional / especialidade**  
  - número de atendimentos concluídos,
  - uso do horário de trabalho (quanto tempo ficou com fila aberta sem paciente, etc.).

Essas métricas podem ser usadas pela coordenação e por parceiros (como o Conecta Social) para avaliar **adesão**, **demanda reprimida** e **qualidade da rede de cuidado**.

---

## 8. Em resumo, o que o gestor precisa guardar?

- A **fila não é só uma lista de espera**: ela é um **orquestrador de jornada** do paciente no dia, respeitando triagem social, prioridades e capacidade de profissionais.
- Nada entra na fila “do nada”: tudo nasce de uma **triagem social estruturada** e de um **Plano de Atendimentos**.
- O sistema foi pensado para ser **justo com o paciente** (ordem de chegada, prioridade para quem ficou sem atendimento) e **justo com o profissional** (registro formal de presença e prova).
- Toda decisão importante (falta, cancelamento, encerramento de dia) fica registrada com **evento de domínio**, permitindo auditoria confiável depois.
