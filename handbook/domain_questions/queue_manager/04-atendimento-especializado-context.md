# 👨‍⚕️ 3.x — Atendimento Especialista Context

> *Contexto de suporte que modela como o profissional interage com as filas: abrir/fechar fila, chamar próximo paciente, registrar presença, anexar prova e concluir atendimento.*

---

## 1. Papel do Atendimento Especialista no domínio

Enquanto o contexto **Filas & Orquestração** é o cérebro que decide **quem** está na fila e **em que ordem**, o **Atendimento Especialista Context** responde:

- **Como o profissional entra no jogo da fila?**
- **Como ele chama o próximo paciente?**
- **Como ele registra presença, prova e conclusão?**

Do ponto de vista do domínio:

- Este contexto **não decide a ordem da fila** (isso é do Core).
- Ele **executa a Ordem de Serviço (OS)** associada à sua especialidade:
  - Abre/fecha a fila do profissional.
  - Pede ao Core "me dá o próximo da minha especialidade".
  - Registra presença, anexar ProvaDeAtendimento e concluir OS.

---

## 2. Atores principais

- **Profissional de Especialidade**
  - Psicólogo, fisioterapeuta, terapeuta, assistente social em modo “especialidade”, etc.
  - Age sobre este contexto via UI ou API (ex.: painel do profissional).

- **Sistema de Filas & Orquestração (Core)**
  - Fornece o “próximo paciente” via `PegarProximo`.
  - Valida regras de fila, prioridade, carryover, paciente ocupado, etc.

- **Painel / UI do Profissional**
  - Exibe fila, próximo paciente, histórico do dia e botões de ação:
    - Abrir fila, Fechar fila, Iniciar atendimento, Anexar prova, Concluir atendimento.

---

## 3. Entidades e Aggregates

### 3.1 Entidade: `Profissional`

> Representa o profissional dentro do contexto de filas: qual especialidade ele atende, se a fila dele está aberta e se está livre ou ocupado.

```ts
Profissional {
  id: ProfissionalID
  especialidadeId: EspecialidadeID
  filaAberta: boolean
  agenda: DiasHoras
  estado: Disponível | Ocupado
}
````

**Comportamento principal**:

* `AbrirFila`

  * Marca `filaAberta = true`.
  * Emite `ProfissionalAbriuFila`.
  * Permite chamar pacientes (`PegarProximo`).

* `ConcluirAtendimento`

  * Recebe uma OS em andamento + ProvaDeAtendimento.
  * Pede ao Core a transição para `Concluída`.
  * Se `filaAberta` continua `true`, permite nova chamada.

* `FecharFila`

  * Marca `filaAberta = false`.
  * Impede novas chamadas (`PegarProximo`), mesmo se ainda houver OS em fila.

> **Importante**: o `Profissional` só se associa a **OS da própria especialidade**. Não há “emprestar” profissional entre especialidades neste modelo.

---

### 3.2 “Sessão de Atendimento” (conceito de fluxo)

Não existe um agregado separado no modelo original, mas para fins de linguagem e UI podemos falar em “Sessão de Atendimento” como:

> *O intervalo entre `AtendimentoIniciado` e `AtendimentoConcluido` de uma OS para um Profissional.*

Essa sessão é representada implicitamente por:

* OS com `status = EmAtendimento`,
* `profissionalId` preenchido,
* timestamps `inicio` e `fim` na OS.

---

## 4. Value Objects e Enums relevantes

* `ProfissionalID` — identidade do profissional (vem de Auth/People).
* `EspecialidadeID` — qual fila lógica esse profissional atende.
* `EstadoProfissional` — `Disponível | Ocupado`.
* `ProvaDeAtendimento` — VO obrigatório para concluir OS:

  * `arquivoId` (ou hash/URL)
  * `tipoDocumento`
  * `timestampEnvio`

---

## 5. Comandos deste contexto

Do ponto de vista de APIs / handlers, o Atendimento Especialista expõe uma série de **comandos de alto nível** que serão traduzidos em chamadas ao Core e em eventos.

### 5.1 `AbrirFila`

**Quem chama**: Profissional
**Pré-condições**:

* Profissional autenticado e autorizado (via Identity & Access).
* Dentro da **JanelaDeOperação** da unidade e agenda do profissional.

**Efeitos**:

1. `Profissional.filaAberta = true`.
2. Evento `ProfissionalAbriuFila` é emitido.
3. Política `Distribuição` é disparada no Core para tentar um `PegarProximo`.

---

### 5.2 `PegarProximo`

**Quem chama**: Atendimento Especialista (em nome do profissional)
**Responsável real pela regra**: Filas & Orquestração (Core)

Fluxo:

1. Verifica se o profissional:

   * tem `filaAberta = true`,
   * está `Disponível`.
2. Solicita ao Core: `Filas.pegarProximo(especialidadeId, profissionalId)`.
3. O Core aplica:

   * Prioridade + FIFO.
   * `BusyPatientPolicy` (se paciente já está em outra OS).
   * Reserva atômica → OS → `Chamado`, evento `OSReservada`.
4. Atendimento Especialista recebe:

   * dados da OS (identificador, paciente, especialidade),
   * posição antiga na fila se necessário (para UI).

Se não houver OS elegível:

* Retorna “fila vazia” ou “todos os pacientes elegíveis ocupados”.
* Profissional permanece `Disponível`.

---

### 5.3 `RegistrarPresenca`

**Quem chama**: Profissional, via UI, quando o paciente entrou na sala.

Efeito:

* Envia ao Core comando para transicionar OS de `Chamado` → `EmAtendimento`.
* Gera evento `AtendimentoIniciado`.
* Marca `Profissional.estado = Ocupado`.

Regra de domínio:
sem presença registrada, não existe atendimento em andamento — não conta nem para presença nem para estatísticas.

---

### 5.4 `AnexarProvaDeAtendimento`

**Quem chama**: Profissional, após concluído o atendimento clínico.

Efeito:

* Envia `ProvaDeAtendimento` ao Core e associa à OS correspondente.
* Gera `ProvaDeAtendimentoAnexada`.
* Deixa a OS apta a ser concluída (pré-condição para `ConcluirAtendimento`).

---

### 5.5 `ConcluirAtendimento`

**Quem chama**: Profissional, ao finalizar o atendimento.

Pré-condições:

* OS em `EmAtendimento`.
* `ProvaDeAtendimento` presente.

Efeitos:

1. Core transiciona OS: `EmAtendimento` → `Concluída`.
2. Gera evento `AtendimentoConcluido`.
3. `Profissional.estado = Disponível`.
4. Política `Distribuição` pode disparar novo `PegarProximo` se `filaAberta = true`.

---

### 5.6 `MarcarNaoCompareceu` (implícito)

Geralmente disparado por timeout, mas a UI do profissional pode ter ação manual de “marcar falta”.

Efeito:

* OS: `Chamado` → `NãoCompareceu`, evento `NaoCompareceuRegistrado`.
* Profissional volta a `Disponível`.
* Pode disparar novo `PegarProximo` se a fila estiver aberta.

---

### 5.7 `FecharFila`

**Quem chama**: Profissional (ou coordenação, via UI de gestão).

Efeitos:

* `Profissional.filaAberta = false`.
* Não é feito `PegarProximo` automaticamente, mesmo se houver OS pendentes.
* Eventual encerramento do dia/CarryOver é responsabilidade do Core.

---

## 6. Eventos vistos deste contexto

Os eventos são definidos no Core, mas têm impacto direto na UI/fluxo do profissional:

| Evento                      | Como afeta Atendimento Especialista                   |
| --------------------------- | ----------------------------------------------------- |
| `ProfissionalAbriuFila`     | Habilita UI de “fila aberta”, dispara `Distribuição`. |
| `OSReservada`               | Mostra na UI qual é o paciente “chamado” agora.       |
| `AtendimentoIniciado`       | Indica que o profissional está em atendimento.        |
| `ProvaDeAtendimentoAnexada` | Mostra que OS pode ser concluída.                     |
| `AtendimentoConcluido`      | Atualiza contadores, libera profissional.             |
| `NaoCompareceuRegistrado`   | Registra falta, libera profissional.                  |

---

## 7. Fluxos típicos do ponto de vista do profissional

### 7.1 Fluxo padrão de atendimento

1. Profissional entra no sistema e vê sua agenda do dia.
2. Clica em **Abrir fila** → `ProfissionalAbriuFila`.
3. O sistema automaticamente executa `PegarProximo`:

   * se houver OS elegível, aparece o próximo paciente.
4. Paciente entra na sala → profissional clica **Iniciar atendimento**:

   * `RegistrarPresenca` → `AtendimentoIniciado`.
5. Profissional conduz o atendimento clínico.
6. Ao final:

   * anexa a **Prova de Atendimento** (`AnexarProvaDeAtendimento`);
   * clica **Concluir atendimento** (`ConcluirAtendimento` → `AtendimentoConcluido`).
7. Se `filaAberta = true`, o sistema tenta de novo `PegarProximo` automaticamente.

---

### 7.2 Fluxo com não comparecimento

1. `PegarProximo` chama um paciente (OS → `Chamado`).
2. Tempo de espera excedido, paciente não aparece.
3. Sistema marca `NaoCompareceuRegistrado`:

   * OS → `NãoCompareceu`;
   * profissional continua `Disponível`.
4. `Distribuição` tenta pegar o próximo da fila.

Opcionalmente, a UI pode permitir que o profissional force `MarcarNaoCompareceu` antes do timeout.

---

### 7.3 Fluxo de encerramento da fila do profissional

1. Profissional deseja parar de atender antes do fim do dia (fim do turno, por exemplo).
2. Clica em **Fechar fila**:

   * `filaAberta = false`, nenhum novo `PegarProximo`.
3. As OS ainda `Prontas` permanecem na `FilaEspecialidade`:

   * Podem ser atendidas por outro profissional da mesma especialidade,
   * ou serão empurradas para `CarryOver` no encerramento do dia.

---

## 8. Invariantes deste contexto

Derivados das regras do domínio de filas:

1. **Especialidade fixa**

   * Um `Profissional` só pode chamar OS da **própria especialidade**.

2. **Fila precisa estar aberta**

   * `PegarProximo` só é permitido se `filaAberta = true`.

3. **Prova obrigatória antes de concluir**

   * Não é permitido `ConcluirAtendimento` sem `ProvaDeAtendimento` válida associada à OS.

4. **Um atendimento por vez**

   * Um profissional não pode estar com **duas OS `EmAtendimento`** simultaneamente (implícito pela associação `profissionalId` + estado).
   * Um paciente também não pode ter duas OS `EmAtendimento` (regra do Core R2).

5. **Auditoria total**

   * Abertura/fechamento de fila, início/conclusão de atendimento, não comparecimento e anexos de prova devem ser rastreáveis via eventos e logs (Regra R10).

---

## 9. Integrações e UI

Do ponto de vista de implementação:

* **UI do Profissional**

  * Consome read models dos Painéis (próximo paciente, fila, histórico).
  * Envia comandos deste contexto (`AbrirFila`, `PegarProximo`, etc.).

* **Auth / Identity & Access**

  * Garante que apenas profissionais autorizados possam:

    * abrir fila,
    * marcar presença,
    * anexar provas.

* **Filas & Orquestração (Core)**

  * É a “fonte da verdade” para OS, fila, prioridades, carryover.
  * Atendimento Especialista funciona praticamente como uma *aplicação cliente* específica para o fluxo do profissional.

---

## 10. Notas rápidas de implementação (.NET / C#) -> Lembrar que vamos usar Bun/Ts e se precisar de algo de baixo nivel será em ZIG.

Sugestões de camada de aplicação:

* **Commands/Handlers**

  * `AbrirFilaCommandHandler`
  * `PegarProximoCommandHandler`
  * `RegistrarPresencaCommandHandler`
  * `AnexarProvaCommandHandler`
  * `ConcluirAtendimentoCommandHandler`
  * `FecharFilaCommandHandler`

* **Serviços**

  * `ProfissionalService` encapsulando uso do `Profissional` + chamadas ao Core (Filas).
  * `PainelProfissionalReadModel` para UI.

* **Integração com Core**

  * Chamadas síncronas (ex.: REST/gRPC) para operações como `PegarProximo`.
  * Eventos (`AtendimentoIniciado`, `AtendimentoConcluido`, etc.) publicados em um bus para read models e outros contextos.

---

## 11. Glossário do Atendimento Especialista

* **Profissional** — agente que executa as OS de uma especialidade.
* **Fila aberta** — estado em que o profissional está disponível para chamar próximos pacientes.
* **Sessão de Atendimento** — período entre início e conclusão de uma OS para aquele profissional.
* **Próximo paciente** — OS que o Core retornou via `PegarProximo`.
* **Prova de Atendimento** — documento anexado que confirma o atendimento presencial.
* **Não compareceu** — paciente chamado que não apareceu dentro do tempo/condição definido.