## 1. Visão Geral

O People Context atua como o **emissor primário de identidade**. Eventos disparados aqui afetam a capacidade de login, a visibilidade de dados sensíveis e a segurança física em toda a unidade. Seguindo o padrão do sistema de filas, dividimos os consumos entre internos e externos.

---

## 🧩 Tabela 1 — Eventos do People Context × Consumidores Internos

**Legenda:**

* **P** = Produz / **C** = Consome
* **FILA** = Filas & Orquestração (Core)
* **TRIA** = Triagem Social (ACDG)
* **ACC** = Access/Building Control (Ponto/Entrada)
* **PAIN** = Painéis & Notificações
* **JUR/TERA** = Jurídico e Terapias

| Evento | Descrição rápida | PEOP | FILA | TRIA | ACC | PAIN | JUR/TERA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **PersonRegistered** | Novo indivíduo (Visitante/Paciente) cadastrado | **P** | C | C | C | C |  |
| **AccountCreated** | Credenciais de login (SSO) geradas e ativas | **P** |  |  |  |  |  |
| **PersonRolePromoted** | Ganho de novos papéis (ex: ADM, Advogado) | **P** | C | C | C | C | C |
| **DataAccessRequested** | Solicitação de acesso a dados de outro setor | **P** |  | C |  |  | C |
| **DataAccessAuthorized** | Acesso concedido por tempo limitado (max 7d) | **P** |  | C |  |  | C |
| **AccountBlocked** | Suspensão global de acesso por segurança | **P** | C | C | C | C | C |
| **PresenceLogged** | Entrada/Saída via leitura de QRCode validada | **P** | C |  | **C** | C |  |
| **ForgetfulnessReq** | Pedido de anonimização (LGPD) | **P** |  | C |  |  |  |

---

## 🌐 Tabela 2 — Eventos do People Context × Sistemas Externos

| Evento | SOC (Social Care) | BI (Analytics) | NOTI (Notificações) | AUTH (Plataforma) |
| --- | --- | --- | --- | --- |
| **PersonRegistered** | C (Sincronia) | C |  | C |
| **PersonRolePromoted** |  | C | C | C |
| **DataAccessRequested** |  |  | C |  |
| **DataAccessAuthorized** |  | C | C |  |
| **PresenceLogged** |  | C |  |  |
| **ForgetfulnessReq** | C (Investigação) | C |  |  |

---

## 📝 Detalhamento dos Eventos

### 1. Identidade e Cadastro

* **`PersonRegistered`**: Disparado na criação do "Golden Record". Fornece o `personId` que servirá de âncora para todos os outros contextos.
* **`PersonRolePromoted`**: Notifica que uma pessoa agora possui novas responsabilidades. Se um `Visitor` for promovido a `Patient`, o contexto de **Filas** fica habilitado a gerar uma `VisitaDoDia` para ele.

### 2. Governança e Acesso a Dados

* **`DataAccessRequested`**: Publica a justificativa e o contexto solicitado (ex: Jurídico pedindo Terapia). Dispara notificações para o profissional responsável ou coordenador.
* **`DataAccessAuthorized`**: Contém o token de acesso temporário e a data de expiração. O sistema de destino (ex: Terapias) usa este evento para liberar a visualização dos dados ao solicitante.

### 3. Presença e Segurança (Ponto Eletrônico)

* **`PresenceLogged`**: Ocorre quando o usuário lê, via App, o QRCode rotativo gerado pelo ESP32.
* **Impacto no Acesso**: O contexto **ACC** registra o log de entrada/saída.
* **Impacto nas Filas**: Pode disparar automaticamente a política de `PacienteChegou` se houver atendimento previsto para o dia.


* **`AccountBlocked`**: Evento de alta prioridade que invalida instantaneamente qualquer sessão ativa em todos os módulos da ACDG.

### 4. Privacidade (LGPD)

* **`ForgetfulnessRequested`**: Inicia o fluxo de "esquecimento". Em vez de deleção imediata, notifica a **Triagem Social** para que a assistente social avalie se a exclusão impacta obrigações legais ou a continuidade do cuidado terapêutico.

---

## 🔁 Políticas de Domínio (Sagas / Reações)

| Política | Evento Gatilho | Ação |
| --- | --- | --- |
| **Auto-Checkin** | `PresenceLogged` | Se o papel for `Patient`, notifica o Core de Filas para iniciar a `VisitaDoDia`. |
| **Revogação Automática** | `Timer (Sistema)` | Quando uma autorização atinge a data de expiração, o acesso é revogado e um log é gerado. |
| **Alerta de Auditoria** | `AccessUnauthorized` | Notifica administradores em caso de tentativas repetidas de acesso a módulos não permitidos pelo `Role`. |

---