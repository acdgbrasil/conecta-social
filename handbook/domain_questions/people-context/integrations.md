## 1. Mapa de Dependências

O People Context é um **Upstream** para quase todos os módulos internos, fornecendo a base de identidade e autorização necessária para a operação.

### 1.1 Relação com Filas & Orquestração (Core)

* **Identidade**: O Core de Filas utiliza o `personId` para registrar a `VisitaDoDia`.
* **Trigger de Presença**: Quando o evento `PresenceLogged` é disparado no People Context (via leitura de QRCode), ele pode acionar automaticamente a política de `PacienteChegou` no Core de Filas se houver um atendimento previsto para o dia.
* **Restrição de Papel**: O sistema de filas valida se o indivíduo possui o `Role: Patient` antes de permitir a entrada em filas de especialidade.

### 1.2 Relação com Triagem Social (ACDG)

* **Criação de Identidade**: A Triagem Social é a principal "porta de entrada". Se uma pessoa chega sem registro, a Triagem solicita ao People Context a criação do `Person` inicial (Visitante).
* **Promoção de Papel**: Após a conclusão da triagem, este contexto emite o comando para adicionar o papel `Patient` ao `personId`, habilitando-o para o sistema de filas.
* **Mediação LGPD**: Pedidos de exclusão de dados (`ForgetfulnessRequested`) são encaminhados para a Triagem para que a assistente social realize a investigação de impacto assistencial.

### 1.3 Relação com Atendimento Especialista

* **Validação de Profissional**: O sistema de atendimento valida se o usuário logado possui o `Role: Professional:<Especialidade>` antes de permitir o comando `AbrirFila`.
* **Broker de Dados**: Quando um profissional precisa de dados de outro setor (ex: Jurídico pedindo Terapia), o People Context orquestra o pedido e a autorização temporária entre os `personIds` envolvidos.

---

## 2. Integração com Sistemas de Infraestrutura

### 2.1 Access / Building Control (Ponto e Entrada)

* **Consumo de Eventos**: O contexto de Access Control consome o evento `PresenceLogged` para manter o histórico de entradas e saídas físicas do prédio.
* **Validação ESP32**: O People Context fornece a API de validação que o App utiliza para ler o QRCode dinâmico gerado pelo hardware, garantindo que o `personId` autenticado no celular é o mesmo que está cruzando a porta.

### 2.2 Auth / Identity & Access (SSO)

* **Provedor de Identidade**: O People Context assume o papel de provedor de SSO (Single Sign-On). Ele autentica o login/senha e fornece o token que carrega os `Roles` do usuário para todos os outros sistemas.
* **Unicidade**: Garante que o usuário use a mesma senha e o mesmo login para acessar o Ponto, o Prontuário e o Jurídico.

---

## 3. Integração com Sistemas Externos (Conecta Raros)

### 3.1 Conecta Social (Social Care Context)

* **Sincronia de Prontuário**: O `personId` da ACDG é mapeado para o `Patient` no Conecta Social. Quando dados sociais são solicitados via People Context, a autorização permite que o sistema ACDG consulte temporariamente o prontuário social externo.

### 3.2 Analysis & Research / BI

* **Fluxo de Eventos**: O People Context envia eventos anonimizados de criação de perfis e mudanças de papéis para o BI, permitindo analisar o volume de novos pacientes e a rotatividade de profissionais.

---

## 4. Matriz de Conectividade Técnica

| Sistema | Meio de Conexão | Dado Trafegado | Frequência |
| --- | --- | --- | --- |
| **Filas** | Eventos (NATS/Rabbit) | `personId`, `PresenceStatus` | Tempo Real |
| **Triagem** | API Síncrona (gRPC/REST) | `taxId`, `identityData` | Sob Demanda |
| **ESP32** | Webhook / WebSocket | `deviceId`, `rotatingKey` | Cada 5 segundos |
| **Jurídico** | Shared Identity Token | `Roles`, `AuthToken` | No Login |
| **Social Care** | ACL / Integration Hub | `Justification`, `AccessDuration` | Na Solicitação |

---

## 5. Resumo das Regras de Integração

1. **Soberania do `personId**`: Nenhum sistema interno pode criar seu próprio identificador de pessoa; todos devem referenciar o UUID gerado pelo People Context.
2. **Autorização por Tempo (TTL)**: Qualquer conexão que exponha dados entre clusters de sistemas (ex: Terapia para Jurídico) deve carregar um selo de expiração de no máximo 7 dias.
3. **Auditoria Centralizada**: Toda vez que um sistema externo ou interno consome um dado de identidade, o People Context registra quem, quando e para qual finalidade.
