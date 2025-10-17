
# Modelo de Dados PostgreSQL para o Conecta Social V2

## Introdução

Este documento descreve a conversão do modelo de dados do MongoDB para um esquema relacional em PostgreSQL. O objetivo é manter uma fidelidade de 1 para 1 com os dados originais, ao mesmo tempo em que se aproveitam os benefícios de um banco de dados relacional, como **integridade de dados, consistência e a capacidade de realizar consultas complexas (JOINs) com alta performance.**

### Princípios de Modelagem

1.  **Normalização**: Estruturas aninhadas e arrays no MongoDB foram convertidos em tabelas separadas com relacionamentos `FOREIGN KEY`. O exemplo mais claro é a tabela `membros_familia`, que representa o array de pessoas dentro de `familyComposition`.
2.  **Integridade de Dados**: Foram utilizados `PRIMARY KEY` (do tipo `UUID` para evitar enumeração de IDs), `FOREIGN KEY` para garantir os relacionamentos, `NOT NULL` para campos obrigatórios e `ENUM` para campos com valores pré-definidos, garantindo que apenas dados válidos sejam inseridos.
3.  **Uso Pragmático de `JSONB`**: Para estruturas aninhadas que são autocontidas e não precisam ser consultadas de forma independente (ex: listas de sintomas em `condicoes_saude` ou a estrutura de violações em `situacoes_violencia`), o tipo `JSONB` foi utilizado. Isso evita a criação excessiva de tabelas pequenas, simplifica o modelo e mantém uma estrutura próxima à do MongoDB, além de oferecer ótima performance de consulta dentro do JSON.
4.  **Observações Polimórficas**: Em vez de criar uma tabela de observação para cada entidade, foi criada uma única tabela `observacoes` com uma associação polimórfica. As colunas `owner_id` e `owner_table` permitem que uma observação pertença a qualquer outra tabela do sistema (uma pessoa, uma condição de moradia, etc.).
5.  **Nomenclatura**: Os nomes de tabelas e colunas estão em português e seguem o padrão `snake_case`.

---

## Esquema SQL Completo

Abaixo está o código SQL para criar todo o esquema no PostgreSQL.

### 1. Tipos Customizados (ENUMs)

Primeiro, criamos os tipos `ENUM` para garantir a consistência dos dados em campos que possuem um conjunto fixo de opções.

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
```

---

### 2. Tabelas Principais

Estas são as tabelas que representam as principais entidades do sistema.

```sql
-- Tabela Central: Pessoa de Referência
-- Armazena os dados do indivíduo principal da família.
-- Funciona como o pivô que conecta todas as outras informações.
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
    id_tecnico_responsavel UUID NOT NULL, -- Deveria referenciar uma tabela de usuários/técnicos
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE pessoas_referencia IS 'Tabela central que armazena os dados da pessoa de referência da família.';
COMMENT ON COLUMN pessoas_referencia.id_tecnico_responsavel IS 'ID do usuário do sistema que realizou o cadastro.';

-- Tabela de Documentos RG
-- Separada para melhor organização, ligada por uma relação 1-para-1 com a pessoa.
CREATE TABLE rgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    orgao_emissor VARCHAR(20) NOT NULL,
    uf_emissao VARCHAR(2) NOT NULL,
    data_emissao DATE NOT NULL
);

-- Tabela de Primeira Entrada na Unidade
CREATE TABLE primeiras_entradas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    descricao_primeira_entrada TEXT,
    motivacao_entrada TEXT,
    unidade_encaminhamento TEXT,
    email_contato_unidade TEXT,
    beneficios_familiares TEXT
);

-- Tabela de Condições de Moradia
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

-- Tabela de Condições de Trabalho e Renda
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
    pessoas_beneficiarias_bpc TEXT[], -- Array de nomes
    pessoas_aposentadas TEXT[], -- Array de nomes
    renda_familiar_total_calculada NUMERIC(10, 2),
    renda_per_capita_calculada NUMERIC(10, 2)
);
COMMENT ON COLUMN condicoes_trabalho_renda.pessoas_beneficiarias_bpc IS 'Armazena os nomes dos beneficiários do BPC.';

-- Tabela de Convivência Familiar e Comunitária
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

-- Tabela de Histórico Institucional
CREATE TABLE historicos_institucionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    historico_guarda_criancas TEXT,
    historico_acolhimento_familiar TEXT,
    possui_membro_em_prisao BOOLEAN,
    possui_adolescente_internado BOOLEAN
);

-- Tabela de Benefícios Eventuais
CREATE TABLE beneficios_eventuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    data_concessao DATE,
    tipo_beneficio INT, -- Pode ser uma tabela separada ou um ENUM
    cpf_falecido_associado VARCHAR(11),
    certidao_nascimento_associada TEXT
);

-- Tabela de Histórico de Medidas Socioeducativas
CREATE TABLE historicos_medidas_socioeducativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    anotacoes_pessoas TEXT[]
);

-- Tabela de Condições de Saúde (Uso de JSONB)
CREATE TABLE condicoes_saude (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    indica_inseguranca_alimentar BOOLEAN,
    possui_membro_abuso_alcool BOOLEAN,
    membros_abuso_alcool JSONB,
    possui_membro_abuso_drogas BOOLEAN,
    membros_abuso_drogas JSONB,
    possui_membro_cuidado_constante BOOLEAN,
    membros_cuidado_constante JSONB,
    possui_membro_medicacao_controlada BOOLEAN,
    membros_medicacao_controlada JSONB,
    possui_doenca_grave BOOLEAN,
    membros_doenca_grave JSONB
);
COMMENT ON TABLE condicoes_saude IS 'Usa JSONB para armazenar listas de membros com condições específicas, evitando tabelas extras.';
COMMENT ON COLUMN condicoes_saude.membros_abuso_alcool IS 'Ex: [{"fullName": "Nome do Membro", "complement": "Detalhes"}]';

-- Tabela de Situações de Violência (Uso de JSONB)
CREATE TABLE situacoes_violencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    violencia JSONB
);
COMMENT ON TABLE situacoes_violencia IS 'Armazena todas as situações de violação em um único campo JSONB para simplificar.';
COMMENT ON COLUMN situacoes_violencia.violencia IS 'Ex: {"trabalho_infantil": {"ocorreu": true, "ocorre_agora": false}, "abuso_sexual": {"ocorreu": false, "ocorre_agora": false}}';

-- Tabela de Composição Familiar (Tabela principal para os membros)
CREATE TABLE composicoes_familiares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_referencia_id UUID NOT NULL UNIQUE REFERENCES pessoas_referencia(id) ON DELETE CASCADE,
    especificacao_social TEXT,
    especificacao_etnia TEXT
);

-- Tabela de Membros da Família (Detalhes de cada pessoa)
CREATE TABLE membros_familia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    composicao_familiar_id UUID NOT NULL REFERENCES composicoes_familiares(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    data_nascimento DATE,
    genero_biologico TEXT,
    parentesco INT, -- Pode ser um ENUM
    pcd BOOLEAN,
    historico_la_psc BOOLEAN,
    -- Documentos (colunas booleanas diretas)
    possui_cn BOOLEAN,
    possui_rg BOOLEAN,
    possui_ctps BOOLEAN,
    possui_cpf BOOLEAN,
    possui_te BOOLEAN,
    -- Estruturas aninhadas modeladas como JSONB para simplicidade
    condicao_educacional JSONB,
    condicao_trabalho JSONB,
    servicos_sociais_participacao JSONB,
    gravidez_info JSONB,
    condicao_saude_pessoal JSONB,
    convivencia_comunitaria_pessoal JSONB,
    historico_socioeducativo_pessoal JSONB,
    historico_institucional_pessoal JSONB
);
COMMENT ON TABLE membros_familia IS 'Cada linha representa um membro da família ligada à composição familiar.';
COMMENT ON COLUMN membros_familia.condicao_educacional IS 'Ex: {"alfabetizado": true, "escolaridade": 5, "estudando": true}';
COMMENT ON COLUMN membros_familia.gravidez_info IS 'Ex: {"meses_gestacao": 6, "faz_pre_natal": true}';


-- Tabela Polimórfica de Observações
-- Pode ser ligada a qualquer outra tabela do sistema.
CREATE TABLE observacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    texto_observacao TEXT NOT NULL,
    id_tecnico_observador UUID NOT NULL, -- FK para a tabela de usuários/técnicos
    owner_id UUID NOT NULL, -- ID do registro pai (ex: id de uma pessoa, de uma condição de moradia, etc.)
    owner_table TEXT NOT NULL, -- Nome da tabela pai (ex: 'pessoas_referencia', 'condicoes_moradia')
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_observacoes_owner ON observacoes (owner_id, owner_table);
COMMENT ON TABLE observacoes IS 'Tabela polimórfica para armazenar anotações de qualquer outra entidade do sistema.';

```
