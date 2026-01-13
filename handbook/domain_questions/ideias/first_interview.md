Perguntas Norteadoras

  - Quais domínios independentes já aparecem nos pacotes atuais (packages/shared, packages/social/social-care) e onde ainda existem “concepts anêmicos”? (DDD Distilled, cap. 2 – Bounded Contexts)
  - Que fluxos críticos atravessam múltiplos contextos e exigem contratos explícitos (events/ACL)? (DDD Distilled, cap. 3 – Context Mapping)
  - Quais invariantes precisam ficar dentro de cada agregado para manter consistência antes de publicar eventos? (DDD Kivro Vermelho, seção sobre Aggregates)
  - Que integrações externas ainda carecem de anticorrupção ou tradução? (DDD Distilled, Anti-Corruption Layer)
  - Como os times/rituais se alinham a esses limites (responsabilidade cognitiva)? (DDD Distilled, cap. 4 – Team Boundaries)



Respostas:

### 1. Quais domínios independentes já aparecem nos pacotes atuais (packages/shared, packages/conecta-raros/social-care) e onde ainda existem “concepts anêmicos”?

Esta é uma ótima pergunta sobre fronteiras. Analisando a estrutura `conecta-social`, já podemos ver a emergência clara de dois Bounded Contexts distintos:

1.  **`Social Care Context` (Core Domain):** Localizado em `packages/conecta-raros/social-care/`, este é o nosso Domínio Principal. Ele contém a lógica de negócio complexa e única do Conecta Social. Sua linguagem é específica para o atendimento social (ex: `Patient`, `RightsViolationReport`, `SocialHealthSummary`).

2.  **`Shared Kernel Context` (Domínio de Suporte Genérico):** Localizado em `packages/shared/`, este é um Bounded Context que fornece ferramentas genéricas e reutilizáveis, independentes de qualquer domínio de negócio específico. Ele contém padrões como `Result`, `DomainError`, `Uuid` e `Option`.

**Sobre Conceitos Anêmicos:**

* **No Novo Modelo (`packages/conecta-raros/social-care`):** O design que construímos é o **oposto de anêmico**; é um **Rich Domain Model**. A lógica de negócio está encapsulada nos próprios objetos de domínio.
    * **Value Objects** como `Diagnosis` e `HousingCondition` possuem regras de validação em seus métodos `create`, garantindo que nunca existam em estado inválido.
    * **Entidades** como `RightsViolationReport` também possuem fábricas estáticas (`create`) que protegem suas invariantes.
    * A **Raiz do Agregado** (`Patient`) será a única responsável por orquestrar regras complexas (como `assignPrimaryCaregiver`), expondo comportamentos de negócio, em vez de apenas *setters*.

* **No Modelo Legado (o `src/domain/entity` original):** O código original **era profundamente anêmico**. As classes de entidade (como `HomeConditions`) eram, em sua maioria, apenas "sacos de propriedades" (Property Bags), com a lógica de negócio espalhada pelos `Controllers` e `Routes`. O refator que fizemos (documentado em relatórios como `05-domain-purity-refactor.md`) foi justamente para mover essa lógica para dentro do domínio, curando o modelo anêmico.

### 2. Que fluxos críticos atravessam múltiplos contextos e exigem contratos explícitos (events/ACL)?

Identificamos três fluxos críticos que cruzam as fronteiras dos Bounded Contexts:

1.  **Criação/Validação de Pessoas (Paciente ou Membro):**
    * **Fluxo:** `Social Care Context` <-> `People Context` (um contexto hipotético, mas necessário, para gerenciar Pessoas/Indivíduos).
    * **Descrição:** Quando um `Patient` ou `FamilyMember` é criado, precisamos garantir que essa "pessoa" exista e tenha dados básicos (nome, CPF, etc.).
    * **Contrato Exigido:** Um **ACL (Anti-Corruption Layer)** no lado do `Social Care`. Este ACL faria chamadas síncronas a um serviço do `People Context` ("obter ou criar pessoa por CPF") e traduziria a resposta para o `personId` que usamos internamente.

2.  **Autorização de Ações Profissionais:**
    * **Fluxo:** `Social Care Context` (Consumidor/Downstream) <- `Identity & Access Context` (Fornecedor/Upstream).
    * **Descrição:** Quando um profissional tenta executar uma ação (ex: `registerAppointment`), nosso `Social Care Context` precisa saber se o `professionalInChargeId` tem permissão para isso.
    * **Contrato Exigido:** Um serviço síncrono (ex: `AuthService.canExecute(...)`) exposto pelo `Identity Context`, que serve como um contrato de **Conformista (Conformist)** ou **Interface Aberta (Open-Host Service)**.

3.  **Geração de Dados para Análise (O Conecta Raros):**
    * **Fluxo:** `Social Care Context` (Fornecedor/Upstream) -> `Analysis & Research Context` (Consumidor/Downstream).
    * **Descrição:** Este é o fluxo mais crítico para o futuro. O `Analysis Context` (Conecta Raros) precisa dos dados gerados no `Social Care` para pesquisa.
    * **Contrato Exigido:** **Eventos de Domínio (Domain Events)**. Quando o `Patient` publica eventos como `RightsViolationReported` ou `SocialCareAppointmentRegistered`, o `Analysis Context` será um "ouvinte" (subscriber). Ele usará um **ACL (Anti-Corruption Layer)** no seu lado para:
        1.  Consumir o evento.
        2.  **Anonimizar** os dados (crucial).
        3.  Traduzir o modelo do evento para seu próprio modelo de leitura otimizado para análise estatística.

### 3. Quais invariantes precisam ficar dentro de cada agregado para manter consistência antes de publicar eventos?

As invariantes são as regras de negócio que o Agregado deve garantir que sejam 100% verdadeiras antes que a transação seja "commitada" e os eventos publicados. Identificamos dois níveis de invariantes em nosso agregado `Patient`:

**A. Invariantes de Value Objects (auto-validação):**
* **`Diagnosis`**: `date` não pode ser no futuro; `icdCode` não pode ser vazio.
* **`HousingCondition`**: `numberOfBedrooms` não pode ser maior que `numberOfRooms`.
* **`SocioeconomicSituation`**: Rendas não podem ser negativas; se `receivesSocialBenefits` é `true`, a lista `socialBenefits` não pode ser vazia.
* **`RightsViolationReport`**: `descriptionOfFact` não pode ser vazia; `reportDate` não pode ser futura.
* **`SocialCareAppointment`**: `date` não pode ser futura; `summary` ou `actionPlan` devem ser preenchidos.

**B. Invariantes de Agregado (regras coordenadas pela Raiz `Patient`):**
Estas são as regras mais complexas, que o `Patient.entity.ts` deve garantir:

1.  **Unicidade do Cuidador Principal:** A lista `familyMembers` só pode conter **um** `FamilyMember` com `isPrimaryCaregiver = true`. O método `assignPrimaryCaregiver` deve garantir essa troca atômica.
2.  **Unicidade de Membros da Família:** O método `addFamilyMember` deve garantir que um `FamilyMember` com um `personId` que já existe na lista não pode ser adicionado novamente.
3.  **Integridade Referencial do Agregado:**
    * Ao criar um `Referral`, a Raiz `Patient` deve validar que o `referredPersonId` existe (ou é o próprio paciente ou está na lista `familyMembers`).
    * Ao criar um `RightsViolationReport`, a Raiz `Patient` deve validar que o `victimId` existe dentro do agregado.

O Agregado `Patient` só pode ser salvo (persistido) e seus eventos publicados se todas essas invariantes (A e B) forem verdadeiras.

### 4. Que integrações externas ainda carecem de anticorrupção ou tradução?

Esta é uma área crítica para a refatoração. O modelo legado estava fortemente acoplado à sua fonte de dados (MongoDB) e misturava lógica de domínio com DTOs. Nosso novo modelo (`social-care`) é puro, mas precisará de ACLs para se comunicar com o mundo exterior.

As integrações que mais carecem de um ACL são:

1.  **Rede SUAS (Cadastro Único / Prontuário SUAS):** Os manuais descrevem um modelo de dados vasto, baseado em formulários (ex: "Condições Habitacionais da Família", "Composição Familiar"). O código legado refletia isso. Precisamos de um **ACL robusto (Serviço de Tradução SUAS)** para:
    * *Importar:* Ler dados do Prontuário SUAS (em seu formato de formulário) e traduzi-los para o nosso Agregado `Patient` rico.
    * *Exportar:* "Achatar" (flatten) nosso agregado `Patient` de volta para o formato de formulário exigido pelo SUAS, caso precisemos enviar dados para eles.
2.  **Sistemas de Saúde (HIS/EHR):** O `Diagnosis` não surge do nada. Ele virá de um sistema de saúde externo. Precisamos de um **ACL (Serviço de Diagnóstico)** que esconda a complexidade desse sistema externo (ex: seu modelo de `EncontroClínico`, `Exames`) e apenas nos forneça os dados limpos (`icdCode`, `date`) para criar nosso VO.
3.  **Persistência (Banco de Dados):** Nossos repositórios (ainda não implementados no novo modelo) atuarão como um ACL para o banco de dados. Eles devem traduzir nosso Agregado `Patient` (com seus VOs e Entidades) para o formato de persistência (seja ele SQL, MongoDB ou outro), garantindo que o domínio permaneça agnóstico à infraestrutura.

### 5. Como os times/rituais se alinham a esses limites (responsabilidade cognitiva)?

Com base nos Bounded Contexts identificados (Q1), a estrutura dos times deve espelhar esses limites para minimizar a carga cognitiva e maximizar a autonomia:

1.  **Time 1: `Social Care Team` (Core Domain)**
    * **Responsabilidade:** Dono exclusivo do `packages/conecta-raros/social-care`.
    * **Composição:** Equipe de produto (feature team) dedicada, composta por desenvolvedores, QAs e um Product Owner (PO) que seja o especialista de domínio (o próprio assistente social ou um representante direto).
    * **Rituais:** Os rituais ágeis (sprints, plannings, reviews) devem ser profundamente imersos na Linguagem Ubíqua (`Patient`, `Referral`, etc.). A validação de features deve ser feita com base na capacidade de executar o trabalho social, não apenas em requisitos técnicos.

2.  **Time 2: `Platform Team` (Shared Kernel & Generic)**
    * **Responsabilidade:** Dono do `packages/shared` e, provavelmente, do `Identity & Access Context`.
    * **Composição:** Equipe de plataforma (enablement team) que fornece ferramentas (`Result`, `Uuid`) e serviços (Auth) para os outros times.
    * **Rituais:** O "cliente" deste time é o `Social Care Team`. Mudanças no `Shared Kernel` devem ser tratadas com extremo cuidado, pois afetam múltiplos consumidores. A relação aqui é de **Fornecedor-Cliente (Customer-Supplier)**.

3.  **Time 3: `Data & Analysis Team` (Futuro Conecta Raros)**
    * **Responsabilidade:** Dono do `Analysis & Research Context`.
    * **Composição:** Engenheiros de dados, analistas de BI, pesquisadores.
    * **Rituais:** Atuam como **Consumidores (Downstream)**. Seus rituais envolvem a definição do contrato de eventos (o que eles precisam receber do `Social Care`) e a implementação do ACL para consumir, anonimizar e transformar esses dados.

Alinhar a estrutura organizacional e os rituais dessa forma garante que o time do `Social Care` possa focar 100% na complexidade do negócio (nosso Core Domain) sem se distrair com a complexidade genérica de autenticação ou de ETL de dados.

## O entrevistado perguntou essas ações:
1. Detalhar os eventos de domínio (payload, versão, consumidores) e registrá-los em handbook/process/retrocompatibilidade.md.
2. Especificar os DTOs de cada ACL prioritária e criar suites BDD correspondentes.
3. Considerar renomear a pasta handbook/ domain_questions/ para handbook/domain_questions/ para evitar problemas de tooling antes de adicionar novas entrevistas.

Respondemos isso:
Sim! Agora estamos prontos. Chegamos ao coração do nosso domínio: a **Raiz do Agregado** (Aggregate Root), a classe **`Patient`**.

Este é o componente mais importante de todo o nosso Bounded Context. Ele não é apenas um "saco de dados"; ele é o **guardião das nossas regras de negócio**.

Com base em tudo o que definimos (nossos VOs e Entidades Internas), vamos agora detalhar a classe `Patient`.

### A Entidade Raiz: `Patient`

#### 1. Propósito (Purpose)

A classe `Patient` é a **Entidade Raiz** do nosso agregado. No DDD, isso significa que ela é o **único ponto de entrada** para qualquer modificação em qualquer parte dos dados do paciente. Nenhuma classe externa pode, por exemplo, modificar um `FamilyMember` ou adicionar um `Referral` diretamente. Ela deve *pedir* ao `Patient` para fazer isso.

O propósito do `Patient` é:
1.  Manter o estado completo e consistente do prontuário social.
2.  **Garantir e aplicar (enforce) todas as Regras de Negócio (Invariantes)** que abrangem múltiplos objetos dentro do agregado.
3.  Expor comportamentos (métodos) claros que representam as ações de negócio do domínio, alinhados com a filosofia do Código Limpo de que métodos devem fazer uma coisa bem feita e ter nomes que revelem a intenção.

#### 2. Atributos do Agregado (State)

O estado do `Patient` é composto por todos os VOs e Entidades que modelamos, além de sua própria identidade.

* `id` (UUID): A identidade global única do `Patient`.
* `personId` (PersonId / UUID): A referência à identidade no Contexto de Pessoas (o ID do indivíduo).
* **Value Objects (VOs) - O Contexto Descritivo:**
    * `diagnosis` (Diagnosis): O diagnóstico principal.
    * `socialHealthSummary` (SocialHealthSummary): O panorama social da saúde.
    * `housingCondition` (HousingCondition): A condição de moradia da família.
    * `socioeconomicSituation` (SocioeconomicSituation): A situação socioeconômica da família.
    * `communitySupportNetwork` (CommunitySupportNetwork): A rede de apoio comunitário.
* **Entidades (Listas) - O Histórico Dinâmico:**
    * `familyMembers` (List<`FamilyMember`>): A lista de membros da família.
    * `appointments` (List<`SocialCareAppointment`>): O histórico de atendimentos.
    * `referrals` (List<`Referral`>): O histórico de encaminhamentos.
    * `violationReports` (List<`RightsViolationReport`>): O histórico de relatos de violação.

#### 3. Métodos de Negócio (Behaviors / Actions)

Estes são os métodos públicos que a classe `Patient` expõe para o mundo exterior (para os Casos de Uso / Use Cases). Estes métodos são a API pública do nosso Agregado.

* `static create(props, personId, diagnosis)`: Método de fábrica (Factory) para criar um *novo* `Patient`. Ele garante que um paciente só possa ser criado com o mínimo necessário para ser válido (sua identidade e seu diagnóstico).
* **Métodos de Atualização de VOs (Garantindo Imutabilidade):**
    * `updateHousingCondition(newCondition)`
    * `updateSocioeconomicSituation(newSituation)`
    * `updateCommunitySupportNetwork(newNetwork)`
    * `updateSocialHealthSummary(newSummary)`
* **Métodos de Gerenciamento de Entidades (Orquestrando o Agregado):**
    * `addFamilyMember(memberData)`
    * `removeFamilyMember(familyMemberId)`
    * `assignPrimaryCaregiver(familyMemberId)`
    * `registerAppointment(appointmentData)`
    * `createReferral(referralData)`
    * `updateReferralStatus(referralId, newStatus, notes)`
    * `reportRightsViolation(reportData)`
    * `updateRightsViolationActions(reportId, newActions)`

#### 4. Regras de Negócio do Agregado (Aggregate Invariants)

Aqui está a parte mais importante. Estas são as **Invariantes** (regras de negócio) que *apenas* a classe `Patient` pode garantir, pois elas envolvem a coordenação de múltiplos objetos.

1.  **`addFamilyMember` (Adicionar Membro da Família)**:
    * **Regra:** O `Patient` *não pode* adicionar um `FamilyMember` se um membro com o mesmo `personId` já existir na lista `familyMembers`.
    * **Propósito:** Garantir a unicidade dos membros da família dentro do contexto do paciente.
2.  **`assignPrimaryCaregiver` (Designar Cuidador Principal)**:
    * **Regra:** Esta é a invariante de agregado mais crítica que definimos. Ao chamar este método, a classe `Patient` *deve*:
        1.  Iterar pela lista `familyMembers` e encontrar o cuidador principal *anterior* (se houver) e chamar um método nele (ex: `unassignAsPrimaryCaregiver()`), que o definirá como `isPrimaryCaregiver = false`.
        2.  Encontrar o `FamilyMember` especificado pelo `familyMemberId` e chamar um método nele (ex: `assignAsPrimaryCaregiver()`), que o definirá como `isPrimaryCaregiver = true`.
        3.  Validar regras adicionais (ex: o `familyMemberId` deve existir na lista).
    * **Propósito:** Garantir a **invariante de negócio** de que "apenas um cuidador principal pode ser designado por vez" dentro do agregado.
3.  **`createReferral` (Criar Encaminhamento)**:
    * **Regra:** O `Patient` deve verificar se o `referredPersonId` (ID da pessoa encaminhada) fornecido nos `referralData` corresponde ao `personId` do próprio `Patient` OU a um `personId` de um `FamilyMember` *existente* na lista `familyMembers`.
    * **Propósito:** Garantir que o sistema não crie encaminhamentos para pessoas que não fazem parte deste caso/agregado, mantendo a fronteira do agregado.
4.  **`reportRightsViolation` (Relatar Violação de Direito)**:
    * **Regra:** Similar ao `createReferral`, o `Patient` deve verificar se o `victimId` fornecido nos `reportData` corresponde ao `personId` do `Patient` ou de um `FamilyMember` válido na lista `familyMembers`.
    * **Propósito:** Garantir que o relato de violação esteja corretamente associado a um membro válido do agregado.
5.  **`update...` VOs (Atualizar Value Objects)**:
    * **Regra:** Os métodos como `updateHousingCondition` não modificam o VO existente. Eles recebem uma *nova instância* do `HousingCondition` (que já foi validada em seu próprio `create`) e a substituem no estado do `Patient`.
    * **Propósito:** Garantir a imutabilidade dos Value Objects, uma prática central do DDD.

Com esta definição do agregado `Patient`, temos o modelo completo. Ele é o "maestro" que gerencia todos os VOs e Entidades que detalhamos, expondo métodos de negócio claros (como `assignPrimaryCaregiver`) e garantindo que todas as regras de domínio sejam sempre aplicadas.