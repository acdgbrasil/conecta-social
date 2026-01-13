# 📡 4. Eventos e Integração (Event Line)

O **Social Care Context** adota uma arquitetura orientada a eventos para notificar o restante do ecossistema sobre mudanças de estado relevantes, garantindo desacoplamento.

---

## 🧩 Tabela 1 — Eventos do Social Care × Consumidores

**Legenda:**
- **P** = Produz (Producer)
- **C** = Consome (Consumer)
- **SOC** = Social Care Context
- **BI** = Analysis & Research
- **ACDG** = Sistema de Filas / Triagem
- **JUR** = Jurídico (Futuro)

| Evento | Gatilho / Descrição | SOC | BI | ACDG | JUR |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`PatientCreated`** | Criação inicial do prontuário (`createFromScratch`) | **P** | C | C | |
| **`FamilyMemberAdded`** | Adição de membro familiar (`addFamilyMember`) | **P** | C | | |
| **`SocialCareAppointmentRegistered`** | (Futuro) Conclusão de atendimento | **P** | C | C | C |
| **`RightsViolationReported`** | (Futuro) Registro de violação de direitos | **P** | C | | C |
| **`ReferralCreated`** | (Futuro) Novo encaminhamento | **P** | C | | |

---

## 📝 Detalhamento dos Eventos Implementados

### 1. `PatientCreated`
Disparado quando um novo paciente é registrado no sistema pela primeira vez.
- **Payload**:
  ```ts
  {
    patientId: string, // UUID do Agregado
    personId: string   // UUID da Identidade (Identity Context)
  }
  ```
- **Uso no ACDG**: Permite que a Triagem saiba que o paciente agora possui um prontuário ativo e pode seguir para filas de especialidade.
- **Uso no BI**: Contabiliza "Novos Pacientes" no período.

### 2. `FamilyMemberAdded`
Disparado quando um membro é adicionado à composição familiar do paciente.
- **Payload**:
  ```ts
  {
    patientId: string,
    memberId: string, // personId do membro
    relationship: string // ex: "MÃE", "CÔNJUGE"
  }
  ```
- **Uso no BI**: Análise demográfica e de composição familiar.

---

## 🔁 Políticas de Domínio (Reações)

Embora o Social Care seja primariamente um produtor neste estágio, ele prepara o terreno para políticas reativas futuras:

| Política | Evento Gatilho | Ação Potencial |
| :--- | :--- | :--- |
| **Alerta de Vulnerabilidade** | `RightsViolationReported` | Notificar coordenação ou Jurídico imediatamente. |
| **Atualização de Cadastro** | `PersonDataUpdated` (do Identity) | Atualizar cache local de nomes (se houver projeção). |

---

## ⚙️ Estrutura Técnica dos Eventos

O sistema utiliza o protocolo padrão `DomainEvent`:

```ts
export interface DomainEvent {
  name: string;       // Nome semântico (ex: PatientCreated)
  id: string;         // UUID único do evento (idempotência)
  occurredAt: Date;   // Timestamp exato da ocorrência
  payload: any;       // Dados relevantes (Serializable)
}
```

A publicação ocorre via `EventBusProtocol`, implementado atualmente pelo adaptador em memória (`in-memory-event-bus`) para testes e desenvolvimento, preparado para substituição por NATS/RabbitMQ em produção.
