# 🧾 3.x — Triagem Social Context (ACDG)

> *Bounded Context da ACDG responsável por receber quem chega “sem nada”, operar a Fila de Triagem, decidir se a pessoa entra na linha de cuidado da unidade e gerar o Plano de Atendimentos que alimenta o domínio de Filas.*  
>  
> **Importante:** este contexto **usa** o Social Care Context (`Patient`, `Referral`, etc.) do Conecta Social, mas **não é** o core desse domínio.:contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

---

## 1. Papel da Triagem Social no mapa de contexto

No **Context Map da ACDG**, temos:

- **Filas & Orquestração (Core)** — coordena `VisitaDoDia`, OS, `FilaEspecialidade`, distribuição.:contentReference[oaicite:2]{index=2}
- **Triagem** — triagem inicial, autenticação, geração do `PlanoDeAtendimentos`.:contentReference[oaicite:3]{index=3}
- **Atendimento Especialista**, **Painéis & Notificações**, **Integrações** etc.:contentReference[oaicite:4]{index=4}

Dentro disso, o **Triagem Social Context** é:

- Um **Bounded Context da ACDG** (Supporting Domain) que:
  - opera a **FilaTriagem** (pacientes não-autenticados),:contentReference[oaicite:5]{index=5}
  - decide se e como a pessoa entra na rede de cuidado da unidade,
  - gera o **PlanoDeAtendimentos** consumido por Filas,
  - media cancelamentos, marcando faltas como justificadas ou não.
- Ele conversa com o **Social Care Context** como um **core externo**:
  - Triagem chama métodos do `Patient` (via SDK/ACL) para registrar atendimentos sociais, encaminhamentos, etc.:contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}

Resumindo:

> Triagem Social ACDG = “porta de entrada + decisão de plano de cuidado”  
> Social Care Context = “prontuário social completo” (domínio à parte, core do Conecta Social).:contentReference[oaicite:8]{index=8}

---

## 2. Atores e visão geral

### 2.1 Atores

- **Pessoa que chega à unidade (não-autenticada)**  
  - Ainda não passou por triagem.
  - Entra na **FilaTriagem** da ACDG (FIFO simples).:contentReference[oaicite:9]{index=9}

- **Assistente Social da ACDG**
  - Atende a fila, conduz entrevista, decide rota de cuidado.
  - Usa o **Social Care Context** (`Patient`) como prontuário social oficial.:contentReference[oaicite:10]{index=10}

- **Filas & Orquestração (Core ACDG)**
  - Consome o resultado da triagem:
    - `PlanoDeAtendimentos`,
    - `CancelamentoAprovado`/`Encaminhado`,
  - cria/atualiza `VisitaDoDia` e OS com base nisso.:contentReference[oaicite:11]{index=11}:contentReference[oaicite:12]{index=12}

- **Outros contextos sociais** (Conecta Social, Analysis & Research)
  - Consomem os dados de prontuário e eventos sociais.

---

## 3. Agregados e entidades deste contexto

> A Triagem Social ACDG tem **modelo próprio**, que conversa com `Patient` (outro BC) via integrações.

### 3.1 Agregado: `FilaTriagem`

> A fila de chegada de quem ainda não é “paciente autenticado” no contexto de filas.

No glossário do domínio: **FilaTriagem = FIFO independente de triagem assistencial (não autenticados)**.:contentReference[oaicite:13]{index=13}

```ts
FilaTriagem {
  unidadeId: UnidadeID
  fila: Queue<TriagemTicket>
}

TriagemTicket {
  ticket: string // identificador exibido na UI
  personId?: PersonId // se já existir no People
  criadoEm: DateTime
}
````

**Invariantes:**

* Apenas **não-autenticados** entram na `FilaTriagem`.
* Enquanto um ticket estiver ativo em `FilaTriagem`, a pessoa **não pode** estar em filas de especialidade (regra R9, vista do Core).

---

### 3.2 Entidade: `PlanoDeAtendimentosACDG`

> Representa o “plano de especialidades” que a Triagem Social gera **para a unidade ACDG**, não o prontuário global.

No glossário de filas, `PlanoDeAtendimentos` é “Conjunto de OS derivadas da triagem, uma por especialidade”.

Aqui, modelamos a parte da triagem:

```ts
PlanoDeAtendimentosACDG {
  id: PlanoId
  pacienteId: PacienteID // já autenticado no sistema
  origemPatientId: PersonId // vinculado ao Social Care Context
  especialidades: Array<{
    especialidadeId: EspecialidadeID
    frequencia: FrequenciaAtendimento // ex.: semanal, quinzenal, mensal
    diasAutorizados: LocalDate[]      // datas sugeridas de comparecimento
    observacoes?: string
  }>
  criadoEm: DateTime
  atualizadoEm?: DateTime
  ativo: boolean
}
```

**Responsabilidades:**

* Dizer **quais especialidades** a pessoa deve fazer na ACDG.
* Sugerir **datas de comparecimento** (usadas por Filas para gerar OS nas Visitas certos).
* Dizer se o plano ainda está **ativo** ou encerrado.

---

### 3.3 “Caso de Triagem” como fluxo, não como agregado pesado

Em vez de criar um mega-agregado `CasoTriagem`, podemos tratar o “Caso de Triagem da unidade” como:

* **Uma sessão de atendimento social** registrada no `Patient` (`registerAppointment` etc.).
* * Atualizações no `PlanoDeAtendimentosACDG` local.
* * Eventos enviados para o domínio de Filas (`TriagemConcluida`).

Assim a fronteira fica clara:

* **Estado social rico** → vive em `Patient` (outro BC/core).
* **Estado operacional da ACDG (fila/planejamento de dia)** → vive no contexto de Filas e Triagem Local.

---

## 4. Integração com Social Care Context

O Social Care Context é descrito como:

> “Core domain do Conecta Social. Implementa o prontuário social (`Patient`) e os value objects que cercam atendimentos, encaminhamentos e relatos de violação.”

### 4.1 O que Triagem pode fazer com `Patient`

Via SDK/ACL (`@conecta/social-care`):

* **Criar paciente social** (se ainda não existe):

  * `Patient.createFromScratch(personId, diagnoses)`
* **Atualizar contexto de vida**:

  * `updateHousingCondition`, `updateSocioEconomicSituation`, `updateCommunitySupportNetwork`, `updateSocialHealthSummary` etc.
* **Registrar atendimento social da triagem**:

  * `registerAppointment` com narrativa do atendimento.
* **Gerar encaminhamentos ou registros de violação**:

  * `createReferral`, `reportRightsViolation`, respeitando invariantes de fronteira. 

> A Triagem **nunca mexe diretamente nas coleções** do `Patient` — sempre via métodos públicos, respeitando o aviso: “Use sempre os métodos do agregado; modificar coleções diretamente quebra invariantes de fronteira.”

### 4.2 Responsabilidades separadas

* **Social Care Context** garante:

  * Diagnóstico inicial obrigatório.
  * Integridade de membros da família.
  * Regras de encaminhamento e violações de direitos.
  * Imutabilidade das listas e histórico social.

* **Triagem Social ACDG** garante:

  * Que toda pessoa atendida na unidade passe pela fila de triagem apropriada.
  * Que exista ou seja criado um `Patient` para base social.
  * Que o **PlanoDeAtendimentosACDG** reflita as decisões da triagem para aquela unidade.
  * Que cancelamentos sejam socialmente justificados ou não.

---

## 5. Comandos e Casos de Uso principais

### 5.1 `EntrarNaFilaDeTriagem`

**Atores**: pessoa que chega na unidade / recepção.
**Efeito**:

1. Cria um `TriagemTicket` na `FilaTriagem` (FIFO).
2. Exibe o ticket na UI (informando posição).

---

### 5.2 `ChamarProximoParaTriagem`

**Atores**: assistente social.
**Fluxo:**

1. Pega o próximo `TriagemTicket` da `FilaTriagem`.
2. Verifica via Integrações:

   * se já existe `PersonId` e/ou `Patient`.
3. Se não existir `Patient`:

   * chama `Patient.createFromScratch(personId, diagnoses)` no Social Care.
4. Abre sessão de atendimento social (via `registerAppointment` em `Patient`).

---

### 5.3 `ConcluirTriagemComPlanoDeAtendimentos`

**Entrada**:

* `patientId` ou `personId`,
* lista de `especialidades` + frequências/dias,
* observações (texto livre).

**Fluxo**:

1. Atualiza ou cria `PlanoDeAtendimentosACDG` para aquele paciente.

2. Registra o atendimento social no `Patient` (narrativa).

3. Publica evento `TriagemConcluida` no domínio de Filas:

   ```ts
   TriagemConcluida {
     pacienteId: PacienteID
     personId: PersonId
     planoId: PlanoId
     especialidades: Array<{
       especialidadeId: EspecialidadeID
       diasAutorizados: LocalDate[]
     }>
   }
   ```

4. O contexto **Filas & Orquestração** recebe esse evento e, quando houver `PacienteChegou` para uma data autorizada, gera as OS correspondentes para a `VisitaDoDia`.

---

### 5.4 `ConcluirTriagemComEncaminhamentoOuCancelamento`

Nem todo mundo que passa pela triagem vira fila na ACDG.

Casos:

* **Encaminhamento para outro serviço**:

  * A triagem usa `Patient.createReferral(...)` no Social Care.
  * Marca internamente o status da triagem para a ACDG como “Encaminhado”.
  * Não publica `TriagemConcluida` com plano (ou publica com plano vazio / flag de encerrado).

* **Não elegível para fila ACDG naquele momento**:

  * Apenas registra `SocialCareAppointment` com a decisão.
  * `PlanoDeAtendimentosACDG.ativo = false`.

---

### 5.5 `AvaliarPedidoDeCancelamentoDeAtendimento`

Integra com fluxo de cancelamento descrito no domínio de filas:

* Em Filas, `CancelamentoSolicitado` leva a `CancelamentoPendente` (prioridade baixa).
* A Triagem Social é acionada para avaliar.

**Fluxo:**

1. Recebe pedido de avaliação de cancelamento (com `osId`, `especialidadeId`, motivo inicial).
2. Assistente social conversa com o paciente.
3. Registra `SocialCareAppointment` com narrativa de motivação.
4. Decide:

   * **Aprovar** → publica `CancelamentoAprovado` no domínio de filas:

     ```ts
     CancelamentoAprovado {
       osId: OSID
       motivo: string
       referenciaSocial: { patientId, appointmentId }
     }
     ```

     Filas marca OS como `Cancelada` e registra **falta justificada**.

   * **Não aprovar** → mantém OS ativa; pode ajustar `PlanoDeAtendimentosACDG` (ex.: mudar frequência).

---

## 6. Eventos relevantes (Triagem ↔ Filas ↔ Social)

Do ponto de vista da ACDG, os eventos que cruzam fronteira são:

* **Da Triagem → Filas**:

  * `TriagemConcluida`
  * `PlanoDeAtendimentosAtualizado` (futuro)
  * `CancelamentoAprovado`

* **De Filas → Triagem/Social**:

  * `NaoCompareceuRegistrado` (pode alimentar análise social)
  * `OSEntrouEmCarryOver` (padrão de não-atendimento pode ser insumo para reavaliação social).

* **Dentro do Social Care Context** (não detalhamos aqui, mas existem eventos como `PatientCreated`, `ReferralCreated`, etc., a serem mapeados segundo o guia de testes/eventos).

---

## 7. Invariantes e Regras de Negócio da Triagem Social

Algumas regras vêm implícitas do modelo de filas e do Social Care:

1. **FilaTriagem é exclusiva de não-autenticados**

   * Enquanto estiver na FilaTriagem, a pessoa não entra em filas de especialidade.

2. **Toda OS nasce de um Plano de Atendimentos**

   * O Core de Filas não inventa OS sozinho: elas derivam de decisões da Triagem (`PlanoDeAtendimentosACDG` + datas autorizadas).

3. **Triagem nunca burla invariantes do `Patient`**

   * Criação e atualização de prontuário social **sempre** passam pelos métodos do agregado `Patient`, respeitando diagnósticos, família, fronteiras de pessoa, etc.

4. **Cancelamento é sempre mediado pela Triagem Social**

   * Regra R4 do domínio de filas: “Cancelamento requer aprovação via relatório”.
   * Isso significa que a origem desse “relatório” é o fluxo de Triagem/Assistência Social.

5. **Auditoria obrigatória**

   * A Triagem é parte da trilha de auditoria do atendimento: toda decisão relevante (entrada em plano, encaminhamento, cancelamento) deve ser rastreável, alinhado à regra R10 de auditoria do domínio de filas.

---

## 8. Fluxos exemplares

### 8.1 Fluxo “primeira triagem → plano → filas”

1. Pessoa chega, recepção aciona `EntrarNaFilaDeTriagem`.
2. Assistente social chama `ChamarProximoParaTriagem`.
3. Triagem:

   * verifica/gera `Patient` no Social Care,
   * registra `registerAppointment` com narrativa social.
4. Assistente define Plano:

   * Fisioterapia semanal por 3 meses,
   * Psicologia quinzenal, etc.
5. Triagem cria/atualiza `PlanoDeAtendimentosACDG`.
6. Evento `TriagemConcluida` é publicado.
7. Quando o paciente comparecer em um dia autorizado, o contexto de Filas:

   * cria `VisitaDoDia`,
   * gera OS por especialidade para aquele dia.

---

### 8.2 Fluxo “pedido de cancelamento”

1. Paciente pede para sair de um atendimento.
2. Filas marca a OS como `CancelamentoPendente` e emite `CancelamentoSolicitado`.
3. Triagem Social:

   * agenda conversa com o paciente,
   * registra `SocialCareAppointment` no `Patient` com contexto/motivo.
4. Assistente decide:

   * se aprovar → `CancelamentoAprovado` (falta justificada),
   * se negar → plano ajustado ou mantido.
5. Filas fecha o ciclo alterando a OS conforme o evento.

---

## 9. Notas de implementação

Sugestão de estrutura (independente de tecnologia, mas pensando no que você já usa):

* **Pacote ACDG Triagem (`acdg/triagem`)**

  * `TriagemTicket`, `FilaTriagem`, `PlanoDeAtendimentosACDG`.
  * Serviços de aplicação:

    * `TriagemService.chamarProximo()`
    * `TriagemService.concluirComPlano(...)`
    * `TriagemService.avaliarCancelamento(...)`
  * Integração com:

    * `@conecta/social-care` (`Patient`, VO`s).
    * `acdg/filas` (eventos `TriagemConcluida`, `CancelamentoAprovado`).

* **Integração com Social Care**

  * Implementada via **ACL** no contexto de Integrações:

    * mapeia DTOs de triagem → VO`s/aggregates do Social Care,
    * garante que o domínio ACDG não importe diretamente detalhes internos do Social Care Context.

* **Testes**

  * Usar o mesmo estilo DDD + EDD com TDD/BDD descrito no `testing-and-domain.md`:

    * testar fluxos: “Triagem conclui com plano válido”, “Triagem aprova cancelamento”, etc.

---

## 10. Glossário específico da Triagem Social ACDG

* **FilaTriagem** — Fila FIFO de pessoas não-autenticadas que chegam na unidade.
* **Triagem Social** — Atendimento social inicial (ou de reavaliação) na unidade, que decide plano/cancelamentos/encaminhamentos.
* **PlanoDeAtendimentosACDG** — Plano de especialidades e datas para a unidade ACDG, consumido pelo domínio de filas.
* **Paciente autenticado (para filas)** — Pessoa que já passou pela triagem e tem plano ativo.
* **Encaminhado** — Caso social que é direcionado a outro serviço, podendo ou não gerar filas na ACDG.
* **CancelamentoAprovado** — Evento indicando que um pedido de saída de fila foi socialmente justificado e aceito.
* **Patient (Social Care Context)** — Agregado do prontuário social, externo ao contexto de filas/triagem ACDG, acessado via SDK/ACL.

---