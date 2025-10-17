# Documentação do Esquema do Banco de Dados - Serviço Social (Conecta Social V2)

## 1. Introdução

Este documento serve como um guia completo para o esquema do banco de dados PostgreSQL do microsserviço Social do sistema Conecta Social. Ele foi projetado para ser compreendido por desenvolvedores, arquitetos e qualquer pessoa interessada em entender a estrutura e o funcionamento dos dados deste serviço.

Abordaremos:
*   Os princípios arquiteturais que guiaram o design.
*   Uma visão geral da arquitetura do banco de dados.
*   Um diagrama visual das relações entre as tabelas.
*   O detalhamento de cada tabela, seu propósito, relacionamentos e colunas.

## 2. Princípios Arquiteturais e Decisões de Design

A modelagem deste banco de dados foi guiada por princípios de robustez, integridade de dados, performance para consultas complexas e manutenibilidade a longo prazo, alinhados com uma arquitetura de microsserviços.

### 2.1. Por que PostgreSQL?

Optamos pelo PostgreSQL por ser um sistema de gerenciamento de banco de dados relacional (SGBDR) maduro, confiável e extremamente poderoso. Ele é a escolha ideal para este serviço devido à natureza inerentemente relacional dos dados socioassistenciais, que exigem:
*   **Integridade Transacional (ACID):** Garantia de que as operações de escrita são atômicas, consistentes, isoladas e duráveis, crucial para dados sensíveis.
*   **Consultas Complexas:** Capacidade de realizar `JOINs` eficientes e consultas analíticas sofisticadas, essenciais para relatórios e análises de dados.
*   **Garantia de Integridade de Dados:** Através de chaves primárias, chaves estrangeiras, restrições `NOT NULL` e tipos customizados (`ENUM`).
*   **Flexibilidade com `JSONB`:** Embora a normalização seja a regra, o `JSONB` oferece um ponto de equilíbrio para dados semi-estruturados ou aninhados que não justificam uma normalização completa.

### 2.2. Abordagem Puramente Relacional (Normalização)

Ao contrário do modelo original em MongoDB, este esquema adota uma abordagem puramente relacional e normalizada. Isso significa que:
*   **Dados Estruturados:** Estruturas aninhadas e arrays de objetos do MongoDB foram transformados em tabelas separadas, conectadas por relacionamentos de chave estrangeira. Isso elimina a redundância e melhora a consistência.
*   **Performance de Consulta:** Consultas que antes exigiriam agregações complexas em `JSONB` agora se beneficiam de `JOINs` otimizados, resultando em melhor performance para relatórios e análises.
*   **Manutenibilidade:** O esquema é mais claro e as dependências entre os dados são explícitas, facilitando o desenvolvimento e a manutenção.

### 2.3. Integridade de Dados

A integridade dos dados é uma prioridade máxima. Para garanti-la, utilizamos:
*   **`PRIMARY KEY` (Chave Primária):** Identificador único para cada registro em uma tabela.
*   **`FOREIGN KEY` (Chave Estrangeira):** Garante a integridade referencial, assegurando que os relacionamentos entre tabelas sejam válidos (ex: uma `Condição de Moradia` deve estar ligada a uma `Pessoa de Referência` existente).
*   **`NOT NULL`:** Impede que colunas obrigatórias fiquem vazias.
*   **`UNIQUE`:** Garante que os valores em uma coluna (ou conjunto de colunas) sejam únicos.
*   **`ENUM` (Tipos Enumerados):** Define um conjunto fixo de valores permitidos para uma coluna, garantindo a consistência dos dados categóricos.

### 2.4. Nomenclatura

*   **Tabelas e Colunas:** Utilizam o padrão `snake_case` (palavras minúsculas separadas por sublinhados).
*   **Idioma:** Nomes de tabelas e colunas estão em português para clareza e alinhamento com o domínio do negócio.

### 2.5. IDs (UUIDs)

Todos os identificadores primários (`id`) são do tipo `UUID` (Universally Unique Identifier).
*   **Vantagens:** Evitam colisões em sistemas distribuídos (microsserviços), não revelam informações sobre o número de registros e são mais seguros contra adivinhação.

### 2.6. Timestamps

A maioria das tabelas inclui colunas `created_at` e `updated_at` (do tipo `TIMESTAMPTZ` - timestamp com fuso horário) para rastrear a criação e a última modificação dos registros, essencial para auditoria e depuração.

## 3. Visão Geral da Arquitetura do Banco de Dados

O esquema é centrado na tabela `pessoas_referencia`, que atua como o pivô principal. A partir dela, diversas outras tabelas se ramificam, formando um dossiê completo sobre a família e seus membros.

*   **`pessoas_referencia`**: A entidade central, representando o indivíduo principal da família.
*   **Relacionamentos 1-para-1**: Tabelas como `rgs`, `primeiras_entradas`, `condicoes_moradia`, `condicoes_trabalho_renda`, `convivencia_familiar_comunitaria`, `historicos_institucionais`, `beneficios_eventuais`, `historicos_medidas_socioeducativas`, `condicoes_saude` e `situacoes_violencia` se relacionam diretamente com `pessoas_referencia` em uma base de 1 para 1 (ou 1 para 0/1).
*   **Relacionamentos 1-para-N**:
    *   `composicoes_familiares` (1 para 1 com `pessoas_referencia`) contém `membros_familia` (1 para N com `composicoes_familiares`).
    *   `observacoes` (1 para N com diversas tabelas, através de chaves estrangeiras concretas).
*   **Tabelas de Lookup**: `tipos_de_violencia`, `tipos_de_parentesco`, `tipos_condicao_saude` fornecem listas de valores válidos para outras tabelas.

## 4. Diagrama de Relacionamento de Entidades (ERD) - Representação Visual

Abaixo, um diagrama Mermaid que ilustra as principais entidades e seus relacionamentos. Este diagrama pode ser renderizado diretamente no Obsidian.

```mermaid
erDiagram
    pessoas_referencia ||--o{ rgs : "1:1 RG"
    pessoas_referencia ||--o{ primeiras_entradas : "1:1 Entrada"
    pessoas_referencia ||--o{ condicoes_moradia : "1:1 Moradia"
    pessoas_referencia ||--o{ condicoes_trabalho_renda : "1:1 Trabalho/Renda"
    pessoas_referencia ||--o{ convivencia_familiar_comunitaria : "1:1 Convivência"
    pessoas_referencia ||--o{ historicos_institucionais : "1:1 Hist. Inst."
    pessoas_referencia ||--o{ beneficios_eventuais : "1:1 Benefícios"
    pessoas_referencia ||--o{ historicos_medidas_socioeducativas : "1:1 Med. Socioeduc."
    pessoas_referencia ||--o{ condicoes_saude : "1:1 Saúde"
    pessoas_referencia ||--o{ situacoes_violencia : "1:1 Violência"
    pessoas_referencia ||--o{ composicoes_familiares : "1:1 Composição"

    composicoes_familiares ||--o{ membros_familia : "1:N Membros"

    membros_familia ||--o{ membro_condicao_educacional : "1:1 Cond. Educ."
    membros_familia ||--o{ membro_condicao_trabalho : "1:1 Cond. Trabalho"
    membros_familia ||--o{ membro_participacao_servicos_sociais : "1:N Part. Serv. Soc."
    membros_familia ||--o{ membro_gravidez_info : "1:1 Gravidez"
    membros_familia ||--o{ membro_condicao_saude_pessoal : "1:1 Saúde Pessoal"
    membros_familia ||--o{ membro_convivencia_comunitaria_pessoal : "1:1 Conv. Com. Pessoal"
    membros_familia ||--o{ membro_historico_socioeducativo_pessoal : "1:1 Hist. Socioeduc. Pessoal"
    membros_familia ||--o{ membro_historico_institucional_pessoal : "1:1 Hist. Inst. Pessoal"

    -- Relacionamentos de Junção (N:M)
    pessoas_referencia }|--|| familia_violencia_associacao : "N:M Violência"
    tipos_de_violencia ||--o{ familia_violencia_associacao : ""

    pessoas_referencia }|--|| familia_condicao_saude_associacao : "N:M Cond. Saúde"
    tipos_condicao_saude ||--o{ familia_condicao_saude_associacao : ""

    -- Observações (1:N para várias tabelas)
    pessoas_referencia ||--o{ observacoes_pessoa_referencia : "1:N Obs."
    condicoes_moradia ||--o{ observacoes_condicao_moradia : "1:N Obs."
    membros_familia ||--o{ observacoes_membro_familia : "1:N Obs."
    membro_condicao_educacional ||--o{ observacoes_membro_condicao_educacional : "1:N Obs."
    membro_condicao_trabalho ||--o{ observacoes_membro_condicao_trabalho : "1:N Obs."
    membro_participacao_servicos_sociais ||--o{ observacoes_membro_participacao_servicos_sociais : "1:N Obs."
    membro_gravidez_info ||--o{ observacoes_membro_gravidez_info : "1:N Obs."
    membro_condicao_saude_pessoal ||--o{ observacoes_membro_condicao_saude_pessoal : "1:N Obs."
    membro_convivencia_comunitaria_pessoal ||--o{ observacoes_membro_convivencia_comunitaria_pessoal : "1:N Obs."
    membro_historico_socioeducativo_pessoal ||--o{ observacoes_membro_historico_socioeducativo_pessoal : "1:N Obs."
    membro_historico_institucional_pessoal ||--o{ observacoes_membro_historico_institucional_pessoal : "1:N Obs."
```

## 5. Detalhamento das Tabelas

A seguir, o detalhamento de cada tabela, incluindo seu propósito, relacionamentos e a definição de suas colunas.

### 5.1. Tipos Customizados (ENUMs)

Primeiro, definimos os tipos enumerados que serão usados em várias tabelas para garantir a consistência dos dados.

```sql
-- Tipos para Condições de Moradia
CREATE TYPE tipo_residencia AS ENUM ('PROPRIA', 'ALUGADA', 'CEDIDA', 'OUTRA');
CREATE TYPE tipo_material_paredes AS ENUM ('ALVENARIA', 'MADEIRA', 'TAIPA', 'MATERIAL_APROVEITADO', 'OUTRO');
CREATE TYPE tipo_acesso_energia AS ENUM ('REDE_PUBLICA', 'GERADOR', 'NAO_POSSUI', 'OUTRO');
CREATE TYPE tipo_abastecimento_agua AS ENUM ('REDE_PUBLICA', 'POCO_ARTESIANO', 'CARRO_PIPA', 'RIO_CORREGO', 'OUTRO');
CREATE TYPE tipo_esgoto AS ENUM ('REDE_PUBLICA', 'FOSSA_SEPTICA', 'FOSSA_RUDE', 'CEU_ABERTO', 'OUTRO');
CREATE TYPE tipo_coleta_lixo AS ENUM ('COLETA_PUBLICA', 'QUEIMADO_ENTERRADO', 'CEU_ABERTO', 'OUTRO');

-- Tipos para Convivência Familiar e Comunitária
CREATE TYPE tipo_avaliacao_relacionamento AS ENUM ('CONFLICT_WITH_VIOLENCE', 'CONFLICT_WITHOUT_VIOLENCE', 'WITHOUT_CONFLICT');

-- Tipos para Localização
CREATE TYPE tipo_localizacao AS ENUM ('URBAN', 'RURAL');

-- Tipos para Status de Requisição de Dados (para o microsserviço de Requisições)
CREATE TYPE status_requisicao AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'EXPIRADO');
CREATE TYPE nome_servico AS ENUM ('SOCIAL', 'JURIDICO', 'MEDICO');
```

### 5.2. `pessoas_referencia`

*   **Propósito:** Tabela central que armazena os dados da pessoa de referência da família. Funciona como o pivô que conecta todas as outras informações detalhadas sobre a família.
*   **Relacionamentos:**
    *   `1:1` com `rgs`, `primeiras_entradas`, `condicoes_moradia`, `condicoes_trabalho_renda`, `convivencia_familiar_comunitaria`, `historicos_institucionais`, `beneficios_eventuais`, `historicos_medidas_socioeducativas`, `condicoes_saude`, `situacoes_violencia`, `composicoes_familiares`.
    *   `1:N` com `observacoes_pessoa_referencia`.
    *   `N:M` com `familia_violencia_associacao` e `familia_condicao_saude_associacao`.

```sql
CREATE TABLE pessoas_referencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    nome_social TEXT,
    nome_mae TEXT NOT NULL,
    nis TEXT,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    genero_biologico TEXT NOT NULL,
    em_acolhimento BOOLEAN NOT NULL DEFAULT false,
    localizacao tipo_localizacao NOT NULL,
    cep VARCHAR(8),
    endereco TEXT NOT NULL,
    numero_endereco VARCHAR(10) NOT NULL,
    complemento_endereco TEXT,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado VARCHAR(2) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    diagnostico_inicial TEXT,
    id_tecnico_responsavel UUID NOT NULL, -- ID do usuário do sistema (de outro microsserviço) que realizou o cadastro.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna           | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da pessoa de referência.                           |
| `nome_completo`          | `TEXT`            | `NOT NULL`                               | Nome completo da pessoa de referência.                                 |
| `nome_social`            | `TEXT`            |                                          | Nome social da pessoa de referência, se aplicável.                     |
| `nome_mae`               | `TEXT`            | `NOT NULL`                               | Nome completo da mãe da pessoa de referência.                          |
| `nis`                    | `TEXT`            |                                          | Número de Identificação Social.                                        |
| `cpf`                    | `VARCHAR(11)`     | `NOT NULL`, `UNIQUE`                     | Cadastro de Pessoa Física, único para cada pessoa.                     |
| `data_nascimento`        | `DATE`            | `NOT NULL`                               | Data de nascimento da pessoa de referência.                            |
| `genero_biologico`       | `TEXT`            | `NOT NULL`                               | Gênero biológico da pessoa.                                            |
| `em_acolhimento`         | `BOOLEAN`         | `NOT NULL`, `DEFAULT false`              | Indica se a pessoa está em situação de acolhimento institucional.      |
| `localizacao`            | `tipo_localizacao` | `NOT NULL`                               | Localização da residência (URBANA ou RURAL).                           |
| `cep`                    | `VARCHAR(8)`      |                                          | Código de Endereçamento Postal.                                        |
| `endereco`               | `TEXT`            | `NOT NULL`                               | Nome da rua, avenida, etc.                                             |
| `numero_endereco`        | `VARCHAR(10)`     | `NOT NULL`                               | Número do imóvel.                                                      |
| `complemento_endereco`   | `TEXT`            |                                          | Complemento do endereço (apto, bloco, etc.).                           |
| `bairro`                 | `TEXT`            | `NOT NULL`                               | Bairro da residência.                                                  |
| `cidade`                 | `TEXT`            | `NOT NULL`                               | Cidade da residência.                                                  |
| `estado`                 | `VARCHAR(2)`      | `NOT NULL`                               | Sigla do estado da residência (ex: 'SP', 'RJ').                        |
| `telefone`               | `VARCHAR(15)`     | `NOT NULL`                               | Telefone de contato da pessoa de referência.                           |
| `diagnostico_inicial`    | `TEXT`            |                                          | Diagnóstico ou avaliação inicial do caso.                              |
| `id_tecnico_responsavel` | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) responsável pelo cadastro.      |
| `created_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação do registro.                                    |
| `updated_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização do registro.                         |

### 5.3. `rgs`

*   **Propósito:** Armazena os dados do Registro Geral (RG) da pessoa de referência. É uma tabela separada para organização, com uma relação 1-para-1 com `pessoas_referencia`.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE rgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    orgao_emissor VARCHAR(20) NOT NULL,
    uf_emissao VARCHAR(2) NOT NULL,
    data_emissao DATE NOT NULL
);
```

| Nome da Coluna           | Tipo de Dado  | Restrições                               | Descrição                                          |
| :----------------------- | :------------ | :--------------------------------------- | :------------------------------------------------- |
| `id`                     | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro de RG.             |
| `pessoa_referencia_id`   | `UUID`        | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.     |
| `numero`                 | `VARCHAR(20)` | `NOT NULL`                               | Número do RG.                                      |
| `orgao_emissor`          | `VARCHAR(20)` | `NOT NULL`                               | Órgão emissor do RG.                               |
| `uf_emissao`             | `VARCHAR(2)`  | `NOT NULL`                               | Unidade Federativa de emissão do RG.               |
| `data_emissao`           | `DATE`        | `NOT NULL`                               | Data de emissão do RG.                             |

### 5.4. `primeiras_entradas`

*   **Propósito:** Registra informações sobre o primeiro contato ou encaminhamento da família com a unidade de atendimento.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE primeiras_entradas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    descricao_primeira_entrada TEXT,
    motivacao_entrada TEXT,
    unidade_encaminhamento TEXT,
    email_contato_unidade TEXT,
    beneficios_familiares TEXT
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`   | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `descricao_primeira_entrada` | `TEXT`       |                                          | Descrição detalhada da primeira entrada na unidade.                    |
| `motivacao_entrada`      | `TEXT`       |                                          | Motivo que levou à primeira entrada ou encaminhamento.                 |
| `unidade_encaminhamento` | `TEXT`       |                                          | Nome da unidade para a qual a família foi encaminhada.                 |
| `email_contato_unidade`  | `TEXT`       |                                          | E-mail de contato da unidade de encaminhamento.                        |
| `beneficios_familiares`  | `TEXT`       |                                          | Descrição dos benefícios familiares recebidos na primeira entrada.     |

### 5.5. `condicoes_moradia`

*   **Propósito:** Detalha as condições da residência da família da pessoa de referência.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE condicoes_moradia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    tipo_residencia tipo_residencia,
    material_paredes_externas tipo_material_paredes,
    acesso_energia_eletrica tipo_acesso_energia,
    abastecimento_agua tipo_abastecimento_agua,
    escoamento_sanitario tipo_esgoto,
    coleta_lixo tipo_coleta_lixo,
    em_area_de_risco BOOLEAN,
    dificuldade_acesso_domicilio BOOLEAN,
    possui_seguro_habitacional BOOLEAN,
    valor_seguro_habitacional NUMERIC(10, 2),
    numero_comodos INT,
    numero_dormitorios INT,
    media_pessoas_por_dormitorio NUMERIC(4, 2)
);
```

| Nome da Coluna                 | Tipo de Dado              | Restrições                               | Descrição                                                              |
| :----------------------------- | :------------------------ | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                           | `UUID`                    | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`         | `UUID`                    | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `tipo_residencia`              | `tipo_residencia`         |                                          | Tipo de residência (própria, alugada, cedida, etc.).                   |
| `material_paredes_externas`    | `tipo_material_paredes`   |                                          | Material predominante das paredes externas.                            |
| `acesso_energia_eletrica`      | `tipo_acesso_energia`     |                                          | Tipo de acesso à energia elétrica.                                     |
| `abastecimento_agua`           | `tipo_abastecimento_agua` |                                          | Forma de abastecimento de água.                                        |
| `escoamento_sanitario`         | `tipo_esgoto`             |                                          | Tipo de escoamento sanitário.                                          |
| `coleta_lixo`                  | `tipo_coleta_lixo`        |                                          | Forma de coleta de lixo.                                               |
| `em_area_de_risco`             | `BOOLEAN`                 |                                          | Indica se a residência está localizada em área de risco.               |
| `dificuldade_acesso_domicilio` | `BOOLEAN`                 |                                          | Indica se há dificuldade de acesso ao domicílio.                       |
| `possui_seguro_habitacional`   | `BOOLEAN`                 |                                          | Indica se a residência possui seguro habitacional.                     |
| `valor_seguro_habitacional`    | `NUMERIC(10, 2)`          |                                          | Valor do seguro habitacional, se possuir.                              |
| `numero_comodos`               | `INT`                     |                                          | Número total de cômodos na residência.                                 |
| `numero_dormitorios`           | `INT`                     |                                          | Número de dormitórios na residência.                                   |
| `media_pessoas_por_dormitorio` | `NUMERIC(4, 2)`           |                                          | Média de pessoas por dormitório.                                       |

### 5.6. `condicoes_trabalho_renda`

*   **Propósito:** Armazena informações detalhadas sobre a situação de trabalho e renda da família da pessoa de referência.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE condicoes_trabalho_renda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    renda_familiar_declarada NUMERIC(10, 2),
    renda_per_capita NUMERIC(10, 2),
    possui_renda_social BOOLEAN,
    valor_bolsa_familia NUMERIC(10, 2),
    valor_bpc NUMERIC(10, 2),
    valor_peti NUMERIC(10, 2),
    outros_valores_sociais NUMERIC(10, 2),
    pessoas_beneficiarias_bpc TEXT[], -- Array de nomes dos beneficiários do BPC.
    pessoas_aposentadas TEXT[], -- Array de nomes das pessoas aposentadas.
    renda_familiar_total_calculada NUMERIC(10, 2),
    renda_per_capita_calculada NUMERIC(10, 2)
);
```

| Nome da Coluna                   | Tipo de Dado     | Restrições                               | Descrição                                                              |
| :------------------------------- | :--------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                             | `UUID`           | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`           | `UUID`           | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `renda_familiar_declarada`       | `NUMERIC(10, 2)` |                                          | Renda familiar declarada.                                              |
| `renda_per_capita`               | `NUMERIC(10, 2)` |                                          | Renda per capita declarada.                                            |
| `possui_renda_social`            | `BOOLEAN`        |                                          | Indica se a família possui alguma renda social.                        |
| `valor_bolsa_familia`            | `NUMERIC(10, 2)` |                                          | Valor recebido do programa Bolsa Família.                              |
| `valor_bpc`                      | `NUMERIC(10, 2)` |                                          | Valor recebido do Benefício de Prestação Continuada (BPC).             |
| `valor_peti`                     | `NUMERIC(10, 2)` |                                          | Valor recebido do Programa de Erradicação do Trabalho Infantil (PETI). |
| `outros_valores_sociais`         | `NUMERIC(10, 2)` |                                          | Outros valores de benefícios sociais recebidos.                        |
| `pessoas_beneficiarias_bpc`      | `TEXT[]`         |                                          | Nomes das pessoas da família que são beneficiárias do BPC.             |
| `pessoas_aposentadas`            | `TEXT[]`         |                                          | Nomes das pessoas da família que são aposentadas.                      |
| `renda_familiar_total_calculada` | `NUMERIC(10, 2)` |                                          | Renda familiar total calculada pelo sistema.                           |
| `renda_per_capita_calculada`     | `NUMERIC(10, 2)` |                                          | Renda per capita calculada pelo sistema.                               |

### 5.7. `convivencia_familiar_comunitaria`

*   **Propósito:** Avalia o relacionamento da família com a comunidade e aspectos de convivência.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE convivencia_familiar_comunitaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    anos_no_estado INT,
    sempre_morou_no_estado BOOLEAN,
    anos_na_cidade INT,
    sempre_morou_na_cidade BOOLEAN,
    anos_no_bairro INT,
    sempre_morou_no_bairro BOOLEAN,
    vitima_ameaca_discriminacao BOOLEAN,
    possui_rede_apoio_proxima BOOLEAN,
    possui_rede_apoio_vizinhos BOOLEAN,
    participa_grupos_apoio BOOLEAN,
    participa_movimentos_sociais BOOLEAN,
    sem_acesso_atividades_lazer BOOLEAN,
    idoso_sem_lazer_ou_interacao BOOLEAN,
    dependentes_ficam_sozinhos BOOLEAN,
    avaliacao_relacao_pais_filhos tipo_avaliacao_relacionamento,
    avaliacao_relacao_irmaos tipo_avaliacao_relacionamento,
    conflito_outros_residentes tipo_avaliacao_relacionamento
);
```

| Nome da Coluna                       | Tipo de Dado                   | Restrições                               | Descrição                                                              |
| :----------------------------------- | :----------------------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                 | `UUID`                         | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`               | `UUID`                         | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `anos_no_estado`                     | `INT`                          |                                          | Número de anos que a família reside no estado.                         |
| `sempre_morou_no_estado`             | `BOOLEAN`                      |                                          | Indica se a família sempre morou no estado.                            |
| `anos_na_cidade`                     | `INT`                          |                                          | Número de anos que a família reside na cidade.                         |
| `sempre_morou_na_cidade`             | `BOOLEAN`                      |                                          | Indica se a família sempre morou na cidade.                            |
| `anos_no_bairro`                     | `INT`                          |                                          | Número de anos que a família reside no bairro.                         |
| `sempre_morou_no_bairro`             | `BOOLEAN`                      |                                          | Indica se a família sempre morou no bairro.                            |
| `vitima_ameaca_discriminacao`        | `BOOLEAN`                      |                                          | Indica se a família foi vítima de ameaças ou discriminação.           |
| `possui_rede_apoio_proxima`          | `BOOLEAN`                      |                                          | Indica se a família possui rede de apoio próxima.                      |
| `possui_rede_apoio_vizinhos`         | `BOOLEAN`                      |                                          | Indica se a família possui rede de apoio de vizinhos.                  |
| `participa_grupos_apoio`             | `BOOLEAN`                      |                                          | Indica se a família participa de grupos de apoio.                      |
| `participa_movimentos_sociais`       | `BOOLEAN`                      |                                          | Indica se a família participa de movimentos sociais.                   |
| `sem_acesso_atividades_lazer`        | `BOOLEAN`                      |                                          | Indica se a família não tem acesso a atividades de lazer.              |
| `idoso_sem_lazer_ou_interacao`       | `BOOLEAN`                      |                                          | Indica se há idoso na família sem lazer ou interação social.           |
| `dependentes_ficam_sozinhos`         | `BOOLEAN`                      |                                          | Indica se dependentes ficam sozinhos em casa.                          |
| `avaliacao_relacao_pais_filhos`      | `tipo_avaliacao_relacionamento` |                                          | Avaliação do relacionamento entre pais e filhos.                       |
| `avaliacao_relacao_irmaos`          | `tipo_avaliacao_relacionamento` |                                          | Avaliação do relacionamento entre irmãos.                              |
| `conflito_outros_residentes`         | `tipo_avaliacao_relacionamento` |                                          | Avaliação de conflitos com outros residentes.                          |

### 5.8. `historicos_institucionais`

*   **Propósito:** Registra o histórico da família com serviços de acolhimento e outras situações institucionais.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE historicos_institucionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    historico_guarda_criancas TEXT,
    historico_acolhimento_familiar TEXT,
    possui_membro_em_prisao BOOLEAN,
    possui_adolescente_internado BOOLEAN
);
```

| Nome da Coluna                   | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                             | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`           | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `historico_guarda_criancas`      | `TEXT`       |                                          | Histórico de guarda de crianças na família.                             |
| `historico_acolhimento_familiar` | `TEXT`       |                                          | Histórico de acolhimento institucional de membros da família.          |
| `possui_membro_em_prisao`        | `BOOLEAN`    |                                          | Indica se algum membro da família está em prisão.                      |
| `possui_adolescente_internado`   | `BOOLEAN`    |                                          | Indica se algum adolescente da família está em medida socioeducativa de internação. |

### 5.9. `beneficios_eventuais`

*   **Propósito:** Registra informações sobre benefícios eventuais concedidos à família.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE beneficios_eventuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    data_concessao DATE,
    tipo_beneficio INT, -- Pode ser uma tabela separada ou um ENUM
    cpf_falecido_associado VARCHAR(11),
    certidao_nascimento_associada TEXT
);
```

| Nome da Coluna           | Tipo de Dado    | Restrições                               | Descrição                                                              |
| :----------------------- | :-------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`          | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`   | `UUID`          | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `data_concessao`         | `DATE`          |                                          | Data de concessão do benefício eventual.                               |
| `tipo_beneficio`         | `INT`           |                                          | Tipo do benefício concedido (pode ser um ID para uma tabela de lookup). |
| `cpf_falecido_associado` | `VARCHAR(11)`   |                                          | CPF de pessoa falecida associado ao benefício (ex: auxílio funeral).   |
| `certidao_nascimento_associada` | `TEXT`          |                                          | Informações da certidão de nascimento associada ao benefício.          |

### 5.10. `historicos_medidas_socioeducativas`

*   **Propósito:** Armazena anotações sobre o cumprimento de medidas socioeducativas por membros da família.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.

```sql
CREATE TABLE historicos_medidas_socioeducativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    anotacoes_pessoas TEXT[] -- Array de anotações textuais sobre as pessoas.
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`   | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `anotacoes_pessoas`      | `TEXT[]`     |                                          | Array de textos com anotações sobre as medidas socioeducativas das pessoas. |

### 5.11. `condicoes_saude`

*   **Propósito:** Registra informações gerais sobre as condições de saúde da família. Os detalhes específicos de cada condição são tratados em tabelas de junção.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.
*   `N:M` com `familia_condicao_saude_associacao` e `tipos_condicao_saude`.

```sql
CREATE TABLE condicoes_saude (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    indica_inseguranca_alimentar BOOLEAN,
    possui_membro_abuso_alcool BOOLEAN,
    possui_membro_abuso_drogas BOOLEAN,
    possui_membro_cuidado_constante BOOLEAN,
    possui_membro_medicacao_controlada BOOLEAN,
    possui_doenca_grave BOOLEAN
);
```

| Nome da Coluna                 | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                           | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`         | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `indica_inseguranca_alimentar` | `BOOLEAN`    |                                          | Indica se a família apresenta insegurança alimentar.                   |
| `possui_membro_abuso_alcool`   | `BOOLEAN`    |                                          | Indica se há membro da família com abuso de álcool.                   |
| `possui_membro_abuso_drogas`   | `BOOLEAN`    |                                          | Indica se há membro da família com abuso de drogas.                   |
| `possui_membro_cuidado_constante` | `BOOLEAN`    |                                          | Indica se há membro da família que necessita de cuidado constante.     |
| `possui_membro_medicacao_controlada` | `BOOLEAN`    |                                          | Indica se há membro da família que usa medicação controlada.           |
| `possui_doenca_grave`          | `BOOLEAN`    |                                          | Indica se há membro da família com doença grave.                       |

### 5.12. `tipos_condicao_saude`

*   **Propósito:** Tabela de lookup para listar os tipos específicos de condições de saúde (ex: "Abuso de Álcool", "Doença Grave", "Necessita de Cuidado Constante").
*   **Relacionamentos:** `1:N` com `familia_condicao_saude_associacao`.

```sql
CREATE TABLE tipos_condicao_saude (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);
```

| Nome da Coluna | Tipo de Dado | Restrições           | Descrição                                      |
| :------------- | :----------- | :------------------- | :--------------------------------------------- |
| `id`           | `SERIAL`     | `PRIMARY KEY`        | Identificador único do tipo de condição de saúde. |
| `nome`         | `TEXT`       | `NOT NULL`, `UNIQUE` | Nome da condição de saúde (ex: "Abuso de Álcool"). |
| `descricao`    | `TEXT`       |                      | Descrição detalhada da condição de saúde.      |

### 5.13. `familia_condicao_saude_associacao`

*   **Propósito:** Tabela de junção para associar uma `Pessoa de Referência` a múltiplos `tipos_condicao_saude`, detalhando quem na família é afetado.
*   **Relacionamentos:** `N:M` entre `pessoas_referencia` e `tipos_condicao_saude`.

```sql
CREATE TABLE familia_condicao_saude_associacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    tipo_condicao_saude_id INT NOT NULL REFERENCES tipos_condicao_saude(id),
    membro_afetado_nome TEXT, -- Nome do membro da família afetado (se aplicável)
    complemento TEXT, -- Detalhes adicionais sobre a condição
    UNIQUE (pessoa_referencia_id, tipo_condicao_saude_id, membro_afetado_nome) -- Para evitar duplicatas
);
```

| Nome da Coluna                 | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                           | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro de associação.                         |
| `pessoa_referencia_id`         | `UUID`       | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a pessoa de referência.                         |
| `tipo_condicao_saude_id`       | `INT`        | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o tipo de condição de saúde.                    |
| `membro_afetado_nome`          | `TEXT`       |                                          | Nome do membro da família afetado por esta condição (se aplicável).   |
| `complemento`                  | `TEXT`       |                                          | Informações complementares sobre a condição de saúde.                  |

### 5.14. `situacoes_violencia`

*   **Propósito:** Registra informações gerais sobre situações de violação de direitos na família. Os detalhes específicos de cada violação são tratados em tabelas de junção.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.
*   `N:M` com `familia_violencia_associacao` e `tipos_de_violencia`.

```sql
CREATE TABLE situacoes_violencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE
    -- As flags booleanas gerais (ex: hasChildLabor) podem ser movidas para cá se necessário,
    -- mas a granularidade está na tabela de associação.
);
```

| Nome da Coluna         | Tipo de Dado | Restrições                               | Descrição                                                              |
| :--------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                   | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id` | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |

### 5.15. `tipos_de_violencia`

*   **Propósito:** Tabela de lookup para listar os tipos específicos de violação de direitos (ex: "Trabalho Infantil", "Abuso Sexual", "Negligência com Idoso").
*   **Relacionamentos:** `1:N` com `familia_violencia_associacao`.

```sql
CREATE TABLE tipos_de_violencia (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);
```

| Nome da Coluna | Tipo de Dado | Restrições           | Descrição                                      |
| :------------- | :----------- | :------------------- | :--------------------------------------------- |
| `id`           | `SERIAL`     | `PRIMARY KEY`        | Identificador único do tipo de violação.       |
| `nome`         | `TEXT`       | `NOT NULL`, `UNIQUE` | Nome da violação (ex: "Trabalho Infantil").    |
| `descricao`    | `TEXT`       |                      | Descrição detalhada do tipo de violação.       |

### 5.16. `familia_violencia_associacao`

*   **Propósito:** Tabela de junção para associar uma `Pessoa de Referência` a múltiplos `tipos_de_violencia`, indicando se a situação ocorreu ou ocorre atualmente.
*   **Relacionamentos:** `N:M` entre `pessoas_referencia` e `tipos_de_violencia`.

```sql
CREATE TABLE familia_violencia_associacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    tipo_violencia_id INT NOT NULL REFERENCES tipos_de_violencia(id),
    ocorreu_no_passado BOOLEAN NOT NULL DEFAULT false,
    ocorre_atualmente BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (pessoa_referencia_id, tipo_violencia_id) -- Para evitar duplicatas
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro de associação.                         |
| `pessoa_referencia_id`   | `UUID`       | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a pessoa de referência.                         |
| `tipo_violencia_id`      | `INT`        | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o tipo de violação.                             |
| `ocorreu_no_passado`     | `BOOLEAN`    | `NOT NULL`, `DEFAULT false`              | Indica se a situação de violência ocorreu no passado.                  |
| `ocorre_atualmente`      | `BOOLEAN`    | `NOT NULL`, `DEFAULT false`              | Indica se a situação de violência ocorre atualmente.                   |

### 5.17. `composicoes_familiares`

*   **Propósito:** Tabela principal para a composição familiar, ligada à pessoa de referência.
*   **Relacionamentos:** `1:1` com `pessoas_referencia`.
*   `1:N` com `membros_familia`.

```sql
CREATE TABLE composicoes_familiares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    especificacao_social TEXT,
    especificacao_etnia TEXT
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `pessoa_referencia_id`   | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para a pessoa de referência.                         |
| `especificacao_social`   | `TEXT`       |                                          | Especificação social da família.                                       |
| `especificacao_etnia`    | `TEXT`       |                                          | Especificação da etnia da família.                                     |

### 5.18. `membros_familia`

*   **Propósito:** Detalha cada membro da família, ligado a uma `composicao_familiar`.
*   **Relacionamentos:** `N:1` com `composicoes_familiares`.
*   `1:1` com `membro_condicao_educacional`, `membro_condicao_trabalho`, `membro_gravidez_info`, `membro_condicao_saude_pessoal`, `membro_convivencia_comunitaria_pessoal`, `membro_historico_socioeducativo_pessoal`, `membro_historico_institucional_pessoal`.
*   `1:N` com `membro_participacao_servicos_sociais`.

```sql
CREATE TABLE membros_familia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    composicao_familia_id UUID NOT NULL REFERENCES composicoes_familiares(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    data_nascimento DATE,
    genero_biologico TEXT,
    parentesco_id INT REFERENCES tipos_de_parentesco(id), -- Chave estrangeira para tipos_de_parentesco
    pcd BOOLEAN,
    historico_la_psc BOOLEAN,
    possui_cn BOOLEAN,
    possui_rg BOOLEAN,
    possui_ctps BOOLEAN,
    possui_cpf BOOLEAN,
    possui_te BOOLEAN
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do membro da família.                              |
| `composicao_familia_id` | `UUID`       | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a composição familiar à qual o membro pertence. |
| `nome_completo`          | `TEXT`       | `NOT NULL`                               | Nome completo do membro da família.                                    |
| `data_nascimento`        | `DATE`       |                                          | Data de nascimento do membro.                                          |
| `genero_biologico`       | `TEXT`       |                                          | Gênero biológico do membro.                                            |
| `parentesco_id`          | `INT`        | `FOREIGN KEY`                            | Chave estrangeira para o tipo de parentesco com a pessoa de referência. |
| `pcd`                    | `BOOLEAN`    |                                          | Indica se o membro é Pessoa com Deficiência.                           |
| `historico_la_psc`       | `BOOLEAN`    |                                          | Indica se o membro possui histórico em serviços socioassistenciais.    |
| `possui_cn`              | `BOOLEAN`    |                                          | Indica se o membro possui Certidão de Nascimento.                      |
| `possui_rg`              | `BOOLEAN`    |                                          | Indica se o membro possui RG.                                          |
| `possui_ctps`            | `BOOLEAN`    |                                          | Indica se o membro possui Carteira de Trabalho e Previdência Social.  |
| `possui_cpf`             | `BOOLEAN`    |                                          | Indica se o membro possui CPF.                                         |
| `possui_te`              | `BOOLEAN`    |                                          | Indica se o membro possui Título de Eleitor.                           |

### 5.19. `tipos_de_parentesco`

*   **Propósito:** Tabela de lookup para listar os tipos de parentesco (ex: "Pai", "Mãe", "Filho(a)").
*   **Relacionamentos:** `1:N` com `membros_familia`.

```sql
CREATE TABLE tipos_de_parentesco (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
);
```

| Nome da Coluna | Tipo de Dado | Restrições           | Descrição                                      |
| :------------- | :----------- | :------------------- | :--------------------------------------------- |
| `id`           | `SERIAL`     | `PRIMARY KEY`        | Identificador único do tipo de parentesco.     |
| `nome`         | `TEXT`       | `NOT NULL`, `UNIQUE` | Nome do parentesco (ex: "Pai", "Filho(a)").   |

### 5.20. `membro_condicao_educacional`

*   **Propósito:** Detalha a condição educacional de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_condicao_educacional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    alfabetizado BOOLEAN,
    escolaridade INT, -- Nível de escolaridade (pode ser um ENUM ou lookup)
    estudando BOOLEAN,
    -- Informações sobre Bolsa Família relacionadas à educação
    bolsa_familia_data_ocorrencia DATE,
    bolsa_familia_efeito INT,
    bolsa_familia_solicitacao_suspensao BOOLEAN
);
```

| Nome da Coluna                   | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                             | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id`              | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `alfabetizado`                   | `BOOLEAN`    |                                          | Indica se o membro é alfabetizado.                                     |
| `escolaridade`                   | `INT`        |                                          | Nível de escolaridade do membro.                                       |
| `estudando`                      | `BOOLEAN`    |                                          | Indica se o membro está estudando atualmente.                          |
| `bolsa_familia_data_ocorrencia`  | `DATE`       |                                          | Data de ocorrência relacionada ao Bolsa Família (educação).            |
| `bolsa_familia_efeito`           | `INT`        |                                          | Efeito relacionado ao Bolsa Família (educação).                        |
| `bolsa_familia_solicitacao_suspensao` | `BOOLEAN`    |                                          | Indica se há solicitação de suspensão do Bolsa Família (educação).     |

### 5.21. `membro_condicao_trabalho`

*   **Propósito:** Detalha a condição de trabalho de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_condicao_trabalho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    possui_carteira_trabalho BOOLEAN,
    condicao_trabalho TEXT, -- Ex: 'Empregado', 'Desempregado', 'Autônomo'
    qualificacao_trabalho TEXT,
    valor_trabalho NUMERIC(10, 2)
);
```

| Nome da Coluna             | Tipo de Dado     | Restrições                               | Descrição                                                              |
| :------------------------- | :--------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                       | `UUID`           | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id`        | `UUID`           | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `possui_carteira_trabalho` | `BOOLEAN`        |                                          | Indica se o membro possui carteira de trabalho.                        |
| `condicao_trabalho`        | `TEXT`           |                                          | Condição atual de trabalho do membro.                                  |
| `qualificacao_trabalho`    | `TEXT`           |                                          | Qualificação profissional do membro.                                   |
| `valor_trabalho`           | `NUMERIC(10, 2)` |                                          | Valor da renda do trabalho do membro.                                  |

### 5.22. `membro_participacao_servicos_sociais`

*   **Propósito:** Registra a participação de um membro da família em serviços, programas ou projetos sociais.
*   **Relacionamentos:** `N:1` com `membros_familia`.

```sql
CREATE TABLE membro_participacao_servicos_sociais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL REFERENCES membros_familia(id) ON DELETE CASCADE,
    servico_programa_projeto TEXT,
    unidade_realizacao TEXT,
    data_realizacao DATE,
    data_conclusao DATE
);
```

| Nome da Coluna           | Tipo de Dado | Restrições                               | Descrição                                                              |
| :----------------------- | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id`      | `UUID`       | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o membro da família.                            |
| `servico_programa_projeto` | `TEXT`       |                                          | Nome do serviço, programa ou projeto social.                           |
| `unidade_realizacao`     | `TEXT`       |                                          | Unidade onde o serviço/programa foi realizado.                         |
| `data_realizacao`        | `DATE`       |                                          | Data de início da participação.                                        |
| `data_conclusao`         | `DATE`       |                                          | Data de conclusão da participação.                                     |

### 5.23. `membro_gravidez_info`

*   **Propósito:** Armazena informações sobre gravidez de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_gravidez_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    meses_gestacao INT,
    faz_pre_natal BOOLEAN
);
```

| Nome da Coluna      | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------ | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id` | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `meses_gestacao`    | `INT`        |                                          | Número de meses de gestação.                                           |
| `faz_pre_natal`     | `BOOLEAN`    |                                          | Indica se a gestante está realizando pré-natal.                        |

### 5.24. `membro_condicao_saude_pessoal`

*   **Propósito:** Detalha condições de saúde específicas de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_condicao_saude_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    necessidades_saude BOOLEAN,
    tipo_deficiencia TEXT,
    responsavel_por_ajuda TEXT
);
```

| Nome da Coluna            | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------------ | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                      | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id`       | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `necessidades_saude`      | `BOOLEAN`    |                                          | Indica se o membro possui necessidades de saúde especiais.             |
| `tipo_deficiencia`        | `TEXT`       |                                          | Tipo de deficiência do membro, se aplicável.                           |
| `responsavel_por_ajuda`   | `TEXT`       |                                          | Nome ou descrição do responsável por ajudar o membro com necessidades de saúde. |

### 5.25. `membro_convivencia_comunitaria_pessoal`

*   **Propósito:** Detalha a convivência comunitária de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_convivencia_comunitaria_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    data_inicio DATE,
    data_fim DATE,
    unidade INT, -- Pode ser um ENUM ou lookup
    tipo_servico INT -- Pode ser um ENUM ou lookup
);
```

| Nome da Coluna      | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------ | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id` | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `data_inicio`       | `DATE`       |                                          | Data de início da convivência comunitária.                             |
| `data_fim`          | `DATE`       |                                          | Data de término da convivência comunitária.                            |
| `unidade`           | `INT`        |                                          | Unidade de convivência comunitária.                                    |
| `tipo_servico`      | `INT`        |                                          | Tipo de serviço de convivência comunitária.                            |

### 5.26. `membro_historico_socioeducativo_pessoal`

*   **Propósito:** Detalha o histórico socioeducativo de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_historico_socioeducativo_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    data_inicio DATE,
    data_fim DATE,
    numero_processo TEXT,
    tipo INT -- Pode ser um ENUM ou lookup
);
```

| Nome da Coluna      | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------ | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id` | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `data_inicio`       | `DATE`       |                                          | Data de início do histórico socioeducativo.                            |
| `data_fim`          | `DATE`       |                                          | Data de término do histórico socioeducativo.                           |
| `numero_processo`   | `TEXT`       |                                          | Número do processo socioeducativo.                                     |
| `tipo`              | `INT`        |                                          | Tipo de medida socioeducativa.                                         |

### 5.27. `membro_historico_institucional_pessoal`

*   **Propósito:** Detalha o histórico institucional de um membro da família.
*   **Relacionamentos:** `1:1` com `membros_familia`.

```sql
CREATE TABLE membro_historico_institucional_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL UNIQUE REFERENCES membros_familia(id) ON DELETE CASCADE,
    data_inicio DATE,
    data_fim DATE,
    razao TEXT
);
```

| Nome da Coluna      | Tipo de Dado | Restrições                               | Descrição                                                              |
| :------------------ | :----------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                | `UUID`       | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único do registro.                                       |
| `membro_familia_id` | `UUID`       | `NOT NULL`, `UNIQUE`, `FOREIGN KEY`      | Chave estrangeira para o membro da família.                            |
| `data_inicio`       | `DATE`       |                                          | Data de início do histórico institucional.                             |
| `data_fim`          | `DATE`       |                                          | Data de término do histórico institucional.                            |
| `razao`             | `TEXT`       |                                          | Razão do histórico institucional.                                      |

### 5.28. `observacoes_pessoa_referencia`

*   **Propósito:** Armazena observações específicas relacionadas à `pessoas_referencia`.
*   **Relacionamentos:** `N:1` com `pessoas_referencia`.

```sql
CREATE TABLE observacoes_pessoa_referencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL, -- ID do técnico (de outro microsserviço) que fez a observação.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna           | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `pessoa_referencia_id`   | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a pessoa de referência.                         |
| `texto_observacao`       | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`  | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.29. `observacoes_condicao_moradia`

*   **Propósito:** Armazena observações específicas relacionadas às `condicoes_moradia`.
*   **Relacionamentos:** `N:1` com `condicoes_moradia`.

```sql
CREATE TABLE observacoes_condicao_moradia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condicao_moradia_id UUID NOT NULL REFERENCES condicoes_moradia(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna           | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `condicao_moradia_id`    | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para as condições de moradia.                        |
| `texto_observacao`       | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`  | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.30. `observacoes_membro_familia`

*   **Propósito:** Armazena observações específicas relacionadas a um `membro_familia`.
*   **Relacionamentos:** `N:1` com `membros_familia`.

```sql
CREATE TABLE observacoes_membro_familia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_familia_id UUID NOT NULL REFERENCES membros_familia(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna           | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                     | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_familia_id`      | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o membro da família.                            |
| `texto_observacao`       | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`  | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`             | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.31. `observacoes_membro_condicao_educacional`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_condicao_educacional`.
*   **Relacionamentos:** `N:1` com `membro_condicao_educacional`.

```sql
CREATE TABLE observacoes_membro_condicao_educacional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_condicao_educacional_id UUID NOT NULL REFERENCES membro_condicao_educacional(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                     | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                             | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_condicao_educacional_id` | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a condição educacional do membro.               |
| `texto_observacao`               | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`          | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.32. `observacoes_membro_condicao_trabalho`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_condicao_trabalho`.
*   **Relacionamentos:** `N:1` com `membro_condicao_trabalho`.

```sql
CREATE TABLE observacoes_membro_condicao_trabalho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_condicao_trabalho_id UUID NOT NULL REFERENCES membro_condicao_trabalho(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                   | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                             | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_condicao_trabalho_id`    | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a condição de trabalho do membro.               |
| `texto_observacao`               | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`          | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.33. `observacoes_membro_participacao_servicos_sociais`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_participacao_servicos_sociais`.
*   **Relacionamentos:** `N:1` com `membro_participacao_servicos_sociais`.

```sql
CREATE TABLE observacoes_membro_participacao_servicos_sociais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_participacao_servicos_sociais_id UUID NOT NULL REFERENCES membro_participacao_servicos_sociais(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                               | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :------------------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                         | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_participacao_servicos_sociais_id`    | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a participação em serviços sociais do membro.   |
| `texto_observacao`                           | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`                      | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                                 | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                                 | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.34. `observacoes_membro_gravidez_info`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_gravidez_info`.
*   **Relacionamentos:** `N:1` com `membro_gravidez_info`.

```sql
CREATE TABLE observacoes_membro_gravidez_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_gravidez_info_id UUID NOT NULL REFERENCES membro_gravidez_info(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                 | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                           | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_gravidez_info_id`      | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para as informações de gravidez do membro.           |
| `texto_observacao`             | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`        | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                   | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                   | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.35. `observacoes_membro_condicao_saude_pessoal`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_condicao_saude_pessoal`.
*   **Relacionamentos:** `N:1` com `membro_condicao_saude_pessoal`.

```sql
CREATE TABLE observacoes_membro_condicao_saude_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_condicao_saude_pessoal_id UUID NOT NULL REFERENCES membro_condicao_saude_pessoal(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                         | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :------------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                   | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_condicao_saude_pessoal_id`     | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a condição de saúde pessoal do membro.          |
| `texto_observacao`                     | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`                | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                           | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                           | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.36. `observacoes_membro_convivencia_comunitaria_pessoal`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_convivencia_comunitaria_pessoal`.
*   **Relacionamentos:** `N:1` com `membro_convivencia_comunitaria_pessoal`.

```sql
CREATE TABLE observacoes_membro_convivencia_comunitaria_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_convivencia_comunitaria_pessoal_id UUID NOT NULL REFERENCES membro_convivencia_comunitaria_pessoal(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                                   | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                             | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_convivencia_comunitaria_pessoal_id`      | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para a convivência comunitária pessoal do membro.    |
| `texto_observacao`                               | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`                          | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.37. `observacoes_membro_historico_socioeducativo_pessoal`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_historico_socioeducativo_pessoal`.
*   **Relacionamentos:** `N:1` com `membro_historico_socioeducativo_pessoal`.

```sql
CREATE TABLE observacoes_membro_historico_socioeducativo_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_historico_socioeducativo_pessoal_id UUID NOT NULL REFERENCES membro_historico_socioeducativo_pessoal(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                                   | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                             | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_historico_socioeducativo_pessoal_id`     | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o histórico socioeducativo pessoal do membro.   |
| `texto_observacao`                               | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`                          | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

### 5.38. `observacoes_membro_historico_institucional_pessoal`

*   **Propósito:** Armazena observações específicas relacionadas à `membro_historico_institucional_pessoal`.
*   **Relacionamentos:** `N:1` com `membro_historico_institucional_pessoal`.

```sql
CREATE TABLE observacoes_membro_historico_institucional_pessoal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_historico_institucional_pessoal_id UUID NOT NULL REFERENCES membro_historico_institucional_pessoal(id) ON DELETE CASCADE,
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Nome da Coluna                                   | Tipo de Dado      | Restrições                               | Descrição                                                              |
| :----------------------------------------------- | :---------------- | :--------------------------------------- | :--------------------------------------------------------------------- |
| `id`                                             | `UUID`            | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único da observação.                                     |
| `membro_historico_institucional_pessoal_id`      | `UUID`            | `NOT NULL`, `FOREIGN KEY`                | Chave estrangeira para o histórico institucional pessoal do membro.    |
| `texto_observacao`                               | `TEXT`            | `NOT NULL`                               | Conteúdo da observação.                                                |
| `id_tecnico_observador`                          | `UUID`            | `NOT NULL`                               | ID do técnico (de outro microsserviço) que registrou a observação.     |
| `created_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora de criação da observação.                                  |
| `updated_at`                                     | `TIMESTAMPTZ`     | `NOT NULL`, `DEFAULT now()`              | Data e hora da última atualização da observação.                       |

---
*(Nota: Com estas adições, o padrão de observações é aplicado a todas as entidades relevantes, especialmente as relacionadas aos membros da família, garantindo a granularidade necessária para o registro de informações qualitativas.)*
---

## 6. Considerações Finais

Este esquema de banco de dados para o microsserviço Social foi projetado para ser robusto, escalável e fácil de manter. Ele adere aos princípios de modelagem relacional, garantindo a integridade e a consistência dos dados, ao mesmo tempo em que oferece excelente performance para as operações de consulta e relatório que são cruciais para um sistema socioassistencial.

A decisão de não incluir uma tabela `usuarios` localmente reflete a arquitetura de microsserviços do sistema Conecta Social, onde a gestão de usuários é centralizada em um serviço dedicado. O `UUID` do técnico é armazenado como uma referência externa, mantendo o acoplamento baixo e a resiliência alta.

Este documento serve como a base para o desenvolvimento e a compreensão do domínio de dados do serviço Social.
