# Catálogo de Integrações — Conecta Social & ACDG

Este documento atua como o **Registro Central de Integrações** do ecossistema. Ele consolida as fronteiras, ACLs (Anti-Corruption Layers) e fluxos de eventos entre os Bounded Contexts.

> **Regra de Ouro**: Nenhuma integração direta (importação de código) é permitida entre contextos diferentes. Toda comunicação deve passar por Contratos Públicos (Eventos, APIs, Interfaces de ACL).

## 🗺️ Mapa de Sistemas

| Sistema | Sigla | Descrição |
| :--- | :--- | :--- |
| **Conecta Raros** | `CR` | Ecossistema guarda-chuva. Inclui o prontuário social (`Social Care`) e análise de dados (`BI`). |
| **Sistema ACDG** | `ACDG` | Gestão operacional da unidade física (Filas, Triagem, Atendimento). |
| **Plataforma** | `PLAT` | Serviços transversais: Identidade, Autenticação, Notificações. |

---

## 🔌 Matriz de Integrações

### 1. Social Care (Conecta Raros)
*Core Domain - Prontuário Social*

| Tipo | Parceiro | Direção | Mecanismo | Contrato / Artefato |
| :--- | :--- | :--- | :--- | :--- |
| **Upstream** | `Identity & People` | Entrada | API Síncrona | `PersonId` (UUID v7) como chave estrangeira. |
| **Downstream** | `Analysis & Research` | Saída | Eventos | `PatientCreated`, `FamilyMemberAdded` (Published Language). |
| **Cliente** | `Format Conversions` | Saída | API/SDK | DTOs de Relatório -> PDF Binário. |
| **Fornecedor** | `Triagem (ACDG)` | Entrada | API/ACL | SDK `@conecta/social-care` (UseCases: `RegisterNewPatient`, `CreateReferral`). |

### 2. Triagem Social (ACDG)
*Supporting Domain - Porta de Entrada*

| Tipo | Parceiro | Direção | Mecanismo | Contrato / Artefato |
| :--- | :--- | :--- | :--- | :--- |
| **Consumidor** | `Social Care` | Saída | ACL (Code) | `SocialCareACL` traduzindo DTOs de triagem para Comandos do Agregado `Patient`. |
| **Produtor** | `Filas (Core)` | Saída | Eventos | `TriagemConcluida` (contendo `PlanoDeAtendimentosACDG`). |
| **Produtor** | `Filas (Core)` | Saída | Eventos | `CancelamentoAprovado` (Mediação de falta). |

### 3. Filas & Orquestração (ACDG)
*Core Domain - Gestão do Dia*

| Tipo | Parceiro | Direção | Mecanismo | Contrato / Artefato |
| :--- | :--- | :--- | :--- | :--- |
| **Consumidor** | `Triagem (ACDG)` | Entrada | Eventos | Escuta `TriagemConcluida` para gerar `OS` na `VisitaDoDia`. |
| **Produtor** | `Painéis & Notificações` | Saída | Eventos | `OSReservada`, `AtendimentoIniciado`, `PacienteChegou`. |
| **Produtor** | `Integrações (ACDG)` | Saída | Eventos | `OSEntrouEmCarryOver`, `NaoCompareceuRegistrado`. |

### 4. Identity & People (Plataforma)
*Generic Domain - Identidade*

| Tipo | Parceiro | Direção | Mecanismo | Contrato / Artefato |
| :--- | :--- | :--- | :--- | :--- |
| **Fornecedor** | `Todos` | Saída | API / Token | `AuthToken` (JWT) contendo `Roles` e `PersonId`. |
| **Fornecedor** | `Acesso Físico` | Saída | Webhook | Validação de QRCode (ESP32) para `PresenceLogged`. |

---

## 🛡️ Camadas Anticorrupção (ACLs) Implementadas

### `SocialCareACL` (no contexto Triagem)
* **Objetivo**: Impedir que o modelo de filas dependa da estrutura interna do `Patient`.
* **Localização**: `packages/acdg/triagem/infrastructure/acl/social-care.acl.ts` (Planejado).
* **Responsabilidade**: Converter `TriagemFormDTO` -> `Patient.createFromScratch(...)`.

### `SuasACL` (Planejado no Social Care)
* **Objetivo**: Traduzir formulários do governo (CadÚnico/SUAS) para o domínio rico.
* **Status**: Pendente.

---

## 📡 Catálogo de Eventos Globais (Published Language)

| Evento | Versão | Payload Chave | Quem Produz | Quem Ouve |
| :--- | :--- | :--- | :--- | :--- |
| `PatientCreated` | v1 | `patientId`, `personId` | Social Care | BI, Triagem |
| `TriagemConcluida` | v1 | `planoId`, `especialidades[]` | Triagem | Filas |
| `AtendimentoConcluido` | v1 | `osId`, `provaAtendimentoId` | Atendimento | Filas, BI |
| `PresenceLogged` | v1 | `personId`, `deviceId` | People | Filas, Segurança |

---

## 🔄 Como atualizar este arquivo

1. **Novo Contexto?** Adicione uma nova tabela na seção "Matriz de Integrações".
2. **Nova Integração?** Adicione uma linha na tabela do contexto existente. Defina se é Upstream (você depende dele) ou Downstream (ele depende de você).
3. **Mudança de Evento?** Atualize a versão e o payload na tabela "Catálogo de Eventos Globais" e registre em `handbook/process/retrocompatibilidade.md`.
