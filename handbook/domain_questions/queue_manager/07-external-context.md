# 🔌 3.x — Integrações Context (Sistema ACDG)

> *Bounded Context de integração que faz a ponte entre o **Sistema ACDG** (Filas, Triagem, Terapias, Jurídico, etc.) e outros sistemas, principalmente o **Sistema Conecta Raros** (Conecta Social), além de Auth, Notificações, Storage e BI.*

---

## 1. Sistemas e Fronteiras

### 1.1 Sistema ACDG

O **Sistema ACDG** é o sistema principal que estamos modelando.  
Ele é composto por vários bounded contexts internos:

- **Filas & Orquestração (Core)**  
  Coordena `VisitaDoDia`, OS, `FilaEspecialidade`, carryover, cancelamentos, faltas.

- **Triagem Social**  
  - Opera a `FilaTriagem` de não-autenticados.  
  - Cria/atualiza o `PlanoDeAtendimentosACDG`.  
  - Media pedidos de cancelamento (falta justificada x não justificada).

- **Atendimento Especialista**  
  - Abre/fecha fila do profissional.  
  - Chama próximo paciente (`PegarProximo`).  
  - Registra presença, anexa ProvaDeAtendimento, conclui atendimento.

- **Painéis & Notificações (Read Models)**  
  - Painel público (TV).  
  - Painel do paciente (privado).  
  - Dashboard do profissional.  
  - Painéis de gestão/admin.

- **Integrações (este capítulo)**  
  - Encapsula chamadas para sistemas externos.  
  - Expõe interfaces limpas para os demais BCs do ACDG.

- **Terapias (futuro, interno ACDG)**  
  - Domínio clínico terapêutico.  
  - Focado no conteúdo terapêutico das sessões, não na fila em si.

- **Jurídico (futuro, interno ACDG)**  
  - Domínio jurídico da ACDG (orientações, casos, prazos).  
  - Pode reutilizar infraestrutura de fila ou ter filas próprias.

- **People Context (interno ACDG)**  
  - Contexto de cadastro de **pessoas que se relacionam com a ACDG** (profissionais, talvez pacientes em algum nível).  
  - Responsável por `personId` e dados básicos necessários para os BCs do ACDG.

- (Possíveis outros futuros)  
  - Financeiro/Convênios, Relatórios internos, etc.

Esses BCs são **todos do mesmo sistema ACDG**.  
Eles podem falar entre si via:

- eventos internos (event bus do ACDG),  
- APIs internas entre BCs (respeitando as fronteiras).

---

### 1.2 Sistema Conecta Raros

Separado do ACDG, temos o **Sistema Conecta Raros**, que é outro sistema, com objetivos próprios.

Ele é composto por:

- **Conecta Social**  
  - Core domain social (Social Care Context, `Patient`, `Referral`, `RightsViolationReport`, etc.).  
  - Mantém o prontuário social completo.

- **Analysis & Research / BI**  
  - Contexto focado em analytics, pesquisa e relatórios.  
  - Consome eventos (inclusive do Conecta Social e, potencialmente, do ACDG) para gerar insights.

- **Format Conversions and Downloads of Forms Types**  
  - Camada/ferramenta para conversão de formatos, geração/baixa de formulários, PDFs, etc.  
  - Usada quando precisamos entregar relatórios ou documentos em formatos específicos.

Para o ACDG, o mais importante é:

- **Conecta Social** → fonte de verdade do prontuário social.  
- **Analysis & Research** → destino de eventos para BI/análises agregadas.  
- **Format Conversions** → eventualmente usado para gerar relatórios/formulários baseados em dados do ACDG.

---

### 1.3 Outros sistemas externos (fora de ACDG e Conecta Raros)

Além do Conecta Raros, o ACDG também conversa com:

- **Auth / Identity & Access**  
  - Sistema de autenticação/autorização (SSO, IAM da instituição).

- **Serviços de Notificações**  
  - Push/SMS/e-mail (plataforma interna ou terceiros).

- **Storage de Arquivos**  
  - Para armazenar **Provas de Atendimento** (documentos assinados, fotos, etc.).

Esses sistemas são “de plataforma” e não pertencem nem ao ACDG, nem ao Conecta Raros.

---

## 2. Papel do Integrações Context

O **Integrações Context** vive *dentro* do Sistema ACDG e tem a função de:

- **Isolar o domínio ACDG** (Filas, Triagem, Terapias, Jurídico, etc.) dos detalhes técnicos e modelos dos sistemas externos.
- Expor para os BCs do ACDG **interfaces estáveis**, em linguagem ubíqua ACDG:
  - “autenticar usuário”,
  - “resolver pessoa pelo personId”,
  - “criar/atualizar patient social”,
  - “enviar notificação para paciente”,
  - “armazenar/recuperar prova de atendimento”,
  - “publicar eventos para BI”.

- Falar, do lado de fora, com:
  - Sistema **Conecta Raros** (via Conecta Social, Analysis & Research, Format Conversions),
  - **Auth**,
  - **Storage**,  
  - **Serviço de Notificações**.

Dentro do ACDG, os demais BCs (Filas, Triagem, Terapias, Jurídico, etc.) **não precisam conhecer** SDKs e APIs externas: eles falam com *Integrações*.

---

## 3. Mapa de Integrações (visão geral)

### 3.1 Do ponto de vista do Sistema ACDG

| Alvo de integração                     | Sistema a que pertence            | Como o ACDG enxerga                         |
| -------------------------------------- | --------------------------------- | ------------------------------------------- |
| **Conecta Social (Social Care Context)**        | Sistema Conecta Raros            | Prontuário social (Patient, Referral, etc.) |
| **Analysis & Research / BI**          | Sistema Conecta Raros            | Destino de eventos para analytics           |
| **Format Conversions & Forms**        | Sistema Conecta Raros            | Geração/baixa de formulários/relatórios     |
| **Auth / Identity & Access**          | Sistema de plataforma            | Login, perfis, permissões                   |
| **Serviço de Notificações**           | Plataforma / terceiros           | Push/SMS/e-mail para usuários ACDG          |
| **Storage de Arquivos**               | Plataforma / infra               | Armazenar ProvaDeAtendimento                |

### 3.2 Relação com BCs internos do ACDG

- **Filas & Orquestração**  
  - Usa Integrações para:
    - gravar/ler provas (Storage),  
    - publicar eventos para BI.

- **Triagem Social (ACDG)**  
  - Usa Integrações para:
    - falar com Conecta Social (criar/usar `Patient`),
    - eventualmente conversar com Format Conversions (relatórios).

- **Terapias (ACDG)**  
  - Pode usar Integrações para:
    - mandar informações para BI,
    - usar Format Conversions para relatórios clínicos.

- **Jurídico (ACDG)**  
  - Pode usar Integrações para:
    - enviar documentos para órgãos externos,
    - registrar eventos/relatórios para BI.

- **People Context (ACDG)**  
  - É interno ao ACDG — pode ser acessado direto pelos BCs ou via uma mini-ACL interna se quiser manter a mesma filosofia, mas **não é um sistema externo**.

---

## 4. Papéis de cada integração (resumido)

### 4.1 Conecta Social (Social Care Context)

- Sistema do Conecta Raros que guarda:
  - `Patient`,
  - `Referral`,
  - `RightsViolationReport`,
  - `SocialCareAppointment`, etc.

No ACDG:

- **Triagem Social ACDG**:
  - cria/atualiza `Patient` no Conecta Social,
  - registra atendimentos sociais,
  - cria encaminhamentos/relatos de violação quando necessário.

Tudo isso **passa pelo Integrações Context**, que expõe um serviço tipo:

```ts
SocialCareAcl {
  createOrLoadPatient(personId, bootstrapData);
  registerTriagemAppointment(patientHandle, dadosTriagem);
  createReferralIfNeeded(patientHandle, dadosEncaminhamento);
}
````

Assim, o domínio ACDG **não importa diretamente** o modelo interno do Social Care.

---

### 4.2 Analysis & Research / BI (Conecta Raros)

* Sistema focado em analytics e pesquisa.
* Do ACDG, ele espera:

  * eventos de presença (`AtendimentoConcluido`),
  * faltas (`NaoCompareceuRegistrado`),
  * carryover (`OSEntrouEmCarryOver`),
  * eventos de triagem (`TriagemConcluida`), etc.

Integrações:

* Formata os eventos do Sistema ACDG num **Published Language** consumível pelo Analysis & Research.
* Pode aplicar **anonimização/pseudonimização** antes de enviar.

---

### 4.3 Format Conversions and Downloads of Forms Types (Conecta Raros)

* Sistema/serviço que:

  * converte dados em formulários/impressos/PDFs,
  * permite baixar modelos de formulários em formatos específicos.

Possíveis usos pelo ACDG via Integrações:

* Gerar relatórios de presença por paciente para fins sociais/jurídicos.
* Gerar documentos padronizados a partir de dados do ACDG + Conecta Social.

---

### 4.4 Auth / Identity & Access

* Sistema de autenticação/autorização da instituição.
* Integrações expõe para ACDG:

  * `AutenticarUsuario(token)`
  * `UsuarioTemPermissao(usuario, permissaoDomain)`

E mapeia isso para os perfis usados nos BCs internos (profissional, assistente social, gestor, admin, etc.).

---

### 4.5 Serviço de Notificações

* Plataforma de envio de notificações (push/SMS/e-mail).
* Integrações oferece para os BCs ACDG algo como:

```csharp
Task NotificarPacienteEhProximo(PacienteId id, EspecialidadeId esp);
Task NotificarFilaEncerrada(PacienteId id, EspecialidadeId esp, LocalDate novaDataSugerida);
Task NotificarMensagemGenerica(PacienteId id, string titulo, string corpo);
```

Os detalhes de provider e canal ficam escondidos no Integrações.

---

### 4.6 Storage de Arquivos (Provas)

* Guarda arquivos físicos (fotos de documentos assinados, PDFs, etc.).
* Integrações expõe:

```csharp
Task<ProvaHandle> UploadProvaAsync(Stream file, ProvaMetadata meta);
Task<Stream> DownloadProvaAsync(ProvaHandle handle);
```

* O domínio de Filas guarda **apenas** o `ProvaHandle` dentro do VO `ProvaDeAtendimento`.

---

## 5. Padrões que o Integrações Context aplica

* **ACL (Anti-Corruption Layer)**

  * Para Conecta Social, BI, Auth, Notificações, Storage, Formats.
  * Tradução entre modelos externos e VO/DTO internos do ACDG.

* **Published Language (Eventos do Sistema ACDG)**

  * Conjunto de eventos (ex.: `PacienteChegou`, `TriagemConcluida`, `AtendimentoConcluido`, `NaoCompareceuRegistrado`, `OSEntrouEmCarryOver`)
  * Consumidos por:

    * BCs internos (Terapias, Jurídico, Painéis),
    * Sistemas externos (BI, eventualmente Conecta Raros via Analysis).

* **Open Host Service**

  * ACDG consome serviços externos como Auth via suas APIs oficiais (OIDC, REST etc).

* **Shared Kernel (opcional)**

  * Tipos básicos (`Uuid`, `Result`, `DomainError`) podem vir de um pacote compartilhado entre sistemas, se fizer sentido.

---

## 6. Resumo em 3 frases

* O **Sistema ACDG** tem vários BCs internos (Filas, Triagem, Terapias, Jurídico, People etc.) e o **Integrações Context** é a borda que fala com o mundo de fora.
* O **Sistema Conecta Raros** é externo, com Conecta Social (prontuário social), Analysis & Research (BI) e Format Conversions (formulários), e é acessado apenas através do Integrações Context.
* Assim, o domínio ACDG fica protegido: ele só fala “Triagem”, “Paciente”, “PlanoDeAtendimentos”, “ProvaDeAtendimento”, e nunca precisa se preocupar com SDKs, formatos estranhos ou detalhes de infra.
