# Relatório de Verificação de Contratos e Domínio (Pós-Remoção Auth)

**Data:** 13/01/2026
**Status:** Verificação Completa e Ajustada

Este relatório documenta a limpeza do domínio `Auth` (removido a pedido) e a verificação de integridade dos contratos Protobuf restantes (`Social Care`, `ACDG`, `People Context`).

## 1. Alterações Realizadas

### 🗑️ Remoção do Auth Domain
- O diretório `contracts/auth/` foi removido.
- O documento `handbook/domain_questions/ideias/auth_domain.md` foi removido.
- **Impacto:** O sistema agora delega a autenticação para um provedor externo ou assume que o `People Context` lida com credenciais básicas (login/senha) via evento `AccountCreated`, sem a complexidade de tokens PST/Offline do design anterior.

### 🔄 Atualização do People Context
Identificamos que o contrato `people_events.proto` estava incompleto em relação à documentação em `handbook/domain_questions/people-context/people-events.md`.

**Novos eventos adicionados ao contrato:**
- `AccountCreated`: Para sinalizar credenciais ativas.
- `DataAccessRequested`: Governança de dados (Workflow de acesso).
- `DataAccessAuthorized`: Concessão de acesso temporário.
- `AccountBlocked`: Segurança e suspensão.
- `ForgetfulnessRequested`: Conformidade com LGPD.

## 2. Estado dos Contratos (Protobuf)

A estrutura atual de contratos (`/contracts`) reflete fielmente os Bounded Contexts ativos:

| Contexto | Arquivo Proto | Cobertura de Eventos | Status |
| :--- | :--- | :--- | :--- |
| **Common** | `common/ids.proto` | UUID, Timestamp, Money | ✅ Estável |
| **Social Care** | `social-care/events/patient_events.proto` | PatientCreated, FamilyMemberAdded, ReferralCreated, RightsViolationReported | ✅ Completo |
| **ACDG (Filas)** | `acdg/events/queue_events.proto` | Ciclo completo de filas (Chegada -> Triagem -> Atendimento -> Conclusão) | ✅ Completo |
| **People** | `people/events/people_events.proto` | Identidade, Papéis, Governança, LGPD, Presença | ✅ Atualizado |

## 3. Próximos Passos Recomendados

1.  **Geração de Código:** Configurar o `buf` para gerar as classes Swift (`packages/acdg/...`) e TypeScript (`packages/shared/...`) automaticamente.
2.  **Implementação de Consumidores:**
    *   O `ACDG` deve consumir `PersonRegistered` (do People) para pré-cadastro.
    *   O `Conecta Raros (BI)` deve consumir todos os eventos para analytics.
3.  **Governança de Dados:** Implementar os handlers para `DataAccessRequested` no `Social Care`, permitindo que o `People Context` orquestre o acesso aos prontuários.

---
*Relatório gerado automaticamente após varredura de integridade.*
