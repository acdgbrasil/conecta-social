# 📍 2. Mapa de Contexto — Sistema Conecta Raros

## 🎯 Objetivo
Definir as fronteiras do **Social Care** dentro do ecossistema Conecta Raros e suas relações com sistemas de apoio e externos.

---

## 🗺️ Visão Geral

```plaintext
                       ┌───────────────────────────────────────┐
                       │              UI / Portal              │
                       │     (Prontuário Social Digital)       │
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
            ┌────────────────────────────────────────────────────┐
            │      ⭐ Social Care Context (Core Domain)          │
            │ - Patient (Aggregate Root)                        │
            │ - FamilyMember, Diagnosis, SocialBenefit          │
            │ - Referral, RightsViolationReport                 │
            └─────────────┬───────────────────────┬─────────────┘
                          │                       │
                Upstream  │                       │  Published Language
               (PersonId) │                       │  (Eventos)
                          ▼                       ▼
        ┌───────────────────────────────┐   ┌───────────────────────────────┐
        │    Identity & People Context  │   │   Analysis & Research (BI)    │
        │ - Cadastro Único de Pessoas   │   │ - Analytics                   │
        │ - Auth / Permissões           │   │ - Pesquisa Clínica/Social     │
        └───────────────────────────────┘   └───────────────────────────────┘
                                                  ▲
                                                  │
                                                  │
        ┌─────────────────────────────────────────┴┐
        │    Format Conversions & Downloads        │
        │ - Geração de Relatórios PDF/Docx         │
        │ - Formulários Padronizados (SUAS/SUS)    │
        └──────────────────────────────────────────┘
```

---

## 2.1 Tabela de Bounded Contexts

| Bounded Context | Responsabilidade Principal | Tipo de Domínio |
| :--- | :--- | :--- |
| **Social Care Context** | Manter o prontuário social, regras de família, vulnerabilidade e intervenções. | ⭐ **Core Domain** |
| **Identity & People** | Identificação única de pessoas (`PersonId`), autenticação e dados cadastrais básicos (nome, CPF). | Generic / Support |
| **Analysis & Research** | Processamento de dados para inteligência, estatísticas e pesquisa (anonimizado). | Supporting / Core (p/ BI) |
| **Format Conversions** | Motor de renderização de documentos e formulários oficiais. | Generic / Infra |
| **ACDG (Filas)** | Gestão de fluxo presencial e triagem (Cliente do Social Care). | Supporting / Core (p/ Ops) |

---

## 2.2 Detalhes de cada Bounded Context

### 1. ⭐ Social Care Context (Core Domain)
**Responsável por:**
- Agregado Raiz `Patient` e todo o ciclo de vida do prontuário social.
- Garantir invariantes de negócio (unicidade de cuidador, regras de benefícios, consistência de diagnósticos).
- Publicar eventos de domínio que alimentam o restante do ecossistema.

**Interage com:**
- **Identity & People** (Upstream): consome `PersonId`.
- **Analysis & Research** (Downstream): envia dados para análise.
- **ACDG / Triagem** (Upstream/Downstream): fornece dados de prontuário para triagem e recebe comandos de criação inicial.

### 2. Identity & People Context
**Responsável por:**
- **Golden Record** da pessoa física (Nome, CPF, Data Nascimento).
- Autenticação e Autorização (RBAC).
- Gerar o `PersonId` (UUID v7) usado como chave estrangeira no Social Care.

### 3. Analysis & Research (BI)
**Responsável por:**
- Ingestão de eventos (`PatientCreated`, `FamilyMemberAdded`, `SocialCareAppointmentRegistered`).
- Anonimização de dados para pesquisa.
- Geração de dashboards epidemiológicos e sociais.

---

## 2.3 Tipos de Relacionamento entre Contextos

| De → Para | Tipo de relação | Descrição |
| :--- | :--- | :--- |
| **Identity & People** → **Social Care** | Upstream / Conformist | Social Care confia plenamente no `PersonId` gerado pelo Identity. |
| **Social Care** → **Analysis & Research** | Published Language | Social Care emite eventos padronizados que o BI consome e processa. |
| **Triagem (ACDG)** → **Social Care** | Cliente de Core Domain | A triagem usa o SDK/ACL do Social Care para criar/consultar pacientes. |
| **Social Care** → **Format Conversions** | Cliente / Generic | Social Care envia DTOs para gerar documentos PDF. |

---

## 2.4 Resumo

- **Social Care é a verdade sobre a condição social**: Ninguém mais decide se uma casa é salubre ou se um benefício é consistente.
- **Identity & People é a verdade sobre quem é a pessoa**: Social Care não valida CPF nem guarda senha.
- **ACDG (Filas) consome Social Care**: A fila depende do prontuário para saber o plano de atendimento, mas não o contrário.
