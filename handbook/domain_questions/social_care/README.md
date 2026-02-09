# 📘 Documento Conciso de Domínio — Sistema Conecta Raros (Social Care)

Documento condensado do domínio do **Sistema Conecta Raros - Módulo Social Care**, baseado na implementação atual em `src/modules/social-care` e no alias público `@conecta/social-care`.

---

## 1. Visão Estratégica

- **Propósito**  
  Centralizar e estruturar o prontuário social de pacientes com doenças raras, garantindo integridade de dados familiares, habitacionais e socioeconômicos para suporte à decisão assistencial e pesquisa.

- **Problema que resolve**  
  Fragmentação de dados sociais, falta de histórico longitudinal e dificuldade em auditar a vulnerabilidade e os direitos dos pacientes.

- **Objetivos**  
  - Garantir consistência de dados (regras de negócio fortes).
  - Permitir evolução histórica (modelo imutável/append-only).
  - Facilitar a integração com sistemas de triagem e pesquisa (BI).

- **Perfis de Usuário**  
  - Assistente Social (Operador principal).
  - Gestor (Auditoria/Monitoramento).
  - Pesquisador (Consumo de dados anonimizados).

---

## 2. Mapa de Contexto

- **Social Care Context (Core Domain)**  
  O coração do sistema. Contém o Agregado `Patient` e todas as regras de negócio social.

- **Identity & People (Upstream)**  
  Fornecedor de identidade (`PersonId`). O Social Care não gerencia logins ou dados civis (RG/CPF), apenas referencias IDs.

- **Analysis & Research (Downstream)**  
  Consumidor de eventos para BI e Analytics.

- **ACDG / Filas (Cliente)**  
  Consome dados do Social Care para realizar triagem e priorização de filas.

---

## 3. O Modelo de Domínio (Resumo)

### 3.1 Agregado `Patient`
A raiz de consistência. Nada muda sem passar por ele.
- **Identidade**: `id` (UUID) e `personId` (FK do Identity).
- **Diagnósticos**: Lista imutável de `Diagnosis` (com `ICDCode` validado).
- **Família**: Lista de `FamilyMember` com gestão de **Cuidador Principal**.
- **Intervenções**: `SocialCareAppointment`, `Referral`, `RightsViolationReport`.
- **Avaliações**: `HousingCondition`, `SocioEconomicSituation`, `SocialHealthSummary`, `CommunitySupportNetwork`.

### 3.2 Principais Regras (Invariantes)
1. **Diagnóstico Obrigatório**: Paciente não existe sem CID.
2. **Cuidador Único**: Apenas um membro da família pode ser cuidador principal.
3. **Imutabilidade**: Value Objects são substituídos, não editados.
4. **Fronteira**: Encaminhamentos só para membros do agregado.
5. **Consistência**: Renda não negativa, banheiros <= quartos, benefícios consistentes.

---

## 4. Integração e Eventos

O sistema comunica mudanças via eventos de domínio:

- **`PatientCreated`**: Novo prontuário iniciado.
- **`FamilyMemberAdded`**: Alteração na composição familiar.
- **`ReferralCreated`**: Encaminhamento social registrado.
- **`RightsViolationReported`**: Violação de direitos reportada.
- **`SocialCareAppointmentRegistered`**: Atendimento social registrado.

---

## 5. Glossário Essencial

| Termo | Definição |
| :--- | :--- |
| **Patient** | Agregado raiz que consolida todo o prontuário social. |
| **PersonId** | Identificador único da pessoa física (vindo do sistema de Identidade). |
| **ICDCode** | Código Internacional de Doenças (CID-10), validado e normalizado. |
| **FamilyMember** | Entidade que representa um familiar vinculado ao paciente. |
| **Cuidador Principal** | Papel exclusivo atribuído a um único membro da família. |
| **Referral** | Encaminhamento formal para serviços da rede (Saúde, Educação, etc.). |
| **RightsViolation** | Relato de violação de direitos (negligência, violência). |
| **HousingCondition** | Objeto de valor descrevendo a moradia (quartos, saneamento). |

## 6. Integrações
Consulte o [Catálogo de Integrações](../../integration-catalog.md) para detalhes sobre ACLs e eventos.
