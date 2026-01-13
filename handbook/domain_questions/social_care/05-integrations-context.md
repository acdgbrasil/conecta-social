# 🔌 5. Integração com Externos (Social Care)

Como o **Social Care Context** interage com o mundo exterior, isolando seu domínio rico através de padrões de integração.

---

## 1. Mapa de Dependências

### 1.1 Identity & People (Upstream)
O Social Care é agnóstico sobre *quem* é a pessoa no mundo real (login, foto, biometria). Ele confia no `PersonId` fornecido pelo contexto de **Identity**.

* **Fluxo**:
  1. O frontend autentica o usuário e obtém o `PersonId`.
  2. O caso de uso `RegisterNewPatient` é chamado passando esse ID.
  3. **Validação**: O repositório verifica se o `PersonId` já existe na base do Social Care (`existsByPersonId`) para evitar duplicidade, retornando erro `APP-003` se necessário.

### 1.2 Repositórios (Port & Adapter)
O domínio define contratos (Ports) que a infraestrutura implementa (Adapters), invertendo a dependência.

* **Port**: `PatientRepositoryProtocol`
  * `save(patient: Patient): Promise<Result<void, DomainError>>`
  * `existsByPersonId(personId: PersonId): Promise<Result<boolean, DomainError>>`
  * `addFamilyMember(familyMember: FamilyMember): ...`

* **Adapter (Atual)**: `PatientSQLiteRepository`
  * Implementação usando `Bun.SQL` e SQLite (em memória para testes/dev).
  * Traduz o Agregado `Patient` (rico) para tabelas relacionais (normalizadas ou documento JSON).

### 1.3 Casos de Uso (Application Layer)
Camada que orquestra o domínio sem vazar regras de negócio para a infraestrutura (HTTP/Controllers).

* **`RegisterNewPatientUseCase`**:
  * **Entrada**: DTO primitivo (`{ personId: string, diagnoses: [...] }`).
  * **Processo**:
    1. Converte DTOs para Value Objects (`createDtoPersonID`, `createDtoIcdCode`).
    2. Checa existência no repositório.
    3. Chama a fábrica do Agregado (`Patient.createFromScratch`).
    4. Persiste via repositório.
    5. Publica eventos via `EventBus`.
  * **Saída**: `Result<boolean, DomainError>`.

---

## 2. Integração com BI e Analytics (Downstream)

A integração com o sistema de **Analysis & Research** é assíncrona e eventual.

* **Mecanismo**: Eventos de Domínio (`PatientCreated`, etc.).
* **Contrato**: Published Language (Schema dos eventos).
* **Objetivo**: Permitir que o BI construa suas próprias projeções (OLAP) sem onerar o banco operacional (OLTP) do Social Care.

---

## 3. Integração com Format Conversions (Utilitário)

Futuramente, o Social Care utilizará o módulo de **Format Conversions** para gerar documentos oficiais.

* **Cenário**: Assistente Social precisa imprimir o "Relatório de Visita Domiciliar".
* **Fluxo**:
  1. Social Care recupera o Agregado `Patient`.
  2. Extrai os dados necessários (`HousingCondition`, `SocioEconomicSituation`).
  3. Envia DTO para o serviço de conversão.
  4. Recebe binário (PDF) para download.

---

## 4. Glossário de Integração

| Termo | Definição |
| :--- | :--- |
| **PersonId** | Identificador universal de pessoas, originado no Identity Context. |
| **ACL (Anti-Corruption Layer)** | Camada que traduz modelos externos para o modelo do Social Care (ex: DTOs de entrada nos Use Cases). |
| **DTO (Data Transfer Object)** | Objetos simples de dados usados para tráfego entre camadas (sem comportamento). |
| **Repository Protocol** | Interface que define como o domínio quer salvar/ler dados, sem saber qual é o banco. |
