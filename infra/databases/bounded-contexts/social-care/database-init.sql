-- ===========================================================================================
-- ARQUIVO: database/init.sql
-- PROJETO: Conecta Raros - Módulo Social Care
-- VERSÃO: 1.0.0 (Auditoria de Domínio Completa)
-- ===========================================================================================

-- 1. EXTENSÕES
-- 'pgcrypto' é necessária para gerar os bytes aleatórios da função UUID v7
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. FUNÇÃO UUID v7 (Polyfill para Postgres < 17)
-- Garante IDs ordenáveis por tempo (Time-Sortable), essenciais para performance de inserção.
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Pega timestamp atual em ms (48 bits)
  unix_ts_ms := substring(
    int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) 
    from 3 for 6
  );
  -- Gera 10 bytes aleatórios
  uuid_bytes := gen_random_bytes(10);
  -- Ajusta versão (v7) e variante (RFC 9562)
  uuid_bytes := set_byte(uuid_bytes, 7, (get_byte(uuid_bytes, 7) & 15) | 112);
  uuid_bytes := set_byte(uuid_bytes, 9, (get_byte(uuid_bytes, 9) & 63) | 128);
  
  RETURN encode(unix_ts_ms || uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;


-- ===========================================================================================
-- CAMADA 1: NÚCLEO DO AGREGADO (Identidade e Estrutura)
-- ===========================================================================================

-- 1.1. Tabela Raiz: PACIENTES
-- Entidade: Patient.entity.ts
CREATE TABLE social_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    person_id UUID NOT NULL UNIQUE, -- Vindo do Identity Context (Golden Record)
    
    current_version INT DEFAULT 0, -- Versionamento para Concorrência Otimista
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DECEASED')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índice vital para performance de buscas por usuário
CREATE INDEX idx_patients_person_id ON social_patients(person_id);


-- 1.2. Membros da Família
-- Entidade: FamilyMember.entity.ts
CREATE TABLE social_family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id) ON DELETE CASCADE,
    person_id UUID NOT NULL, -- Identity do membro
    
    relationship VARCHAR(50) NOT NULL, -- (ex: MÃE, PAI, AVÓ)
    is_primary_caregiver BOOLEAN DEFAULT FALSE,
    resides_with_patient BOOLEAN DEFAULT TRUE,
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE, -- Soft Delete para histórico

    -- Regra de Domínio: A mesma pessoa não pode estar duplicada na família ativa
    CONSTRAINT uq_patient_member UNIQUE (patient_id, person_id)
);

-- REGRA DE DOMÍNIO (Cuidador Único): 
-- Garante atomicidade: Apenas 1 cuidador principal ativo por paciente.
CREATE UNIQUE INDEX idx_unique_primary_caregiver 
ON social_family_members (patient_id) 
WHERE is_primary_caregiver = TRUE AND removed_at IS NULL;


-- ===========================================================================================
-- CAMADA 2: AVALIAÇÕES E CONTEXTO (Log Imutável / Append-Only)
-- Tudo aqui gera histórico. Não usamos UPDATE, apenas INSERT.
-- ===========================================================================================

-- 2.1. Histórico de Diagnósticos
-- Value Object: Diagnosis.valueObject.ts
CREATE TABLE social_patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id) ON DELETE CASCADE,
    
    icd_code VARCHAR(10) NOT NULL, -- CID-10 (ex: G71.0)
    description TEXT NOT NULL,
    diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2.2. Condição de Moradia
-- Value Object: HousingCondition.valueObject.ts
CREATE TABLE social_housing_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id) ON DELETE CASCADE,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Campos mapeados do Value Object
    ownership_type VARCHAR(50) NOT NULL,    -- OWNED, RENTED...
    construction_type VARCHAR(50) NOT NULL, -- MASONRY, WOOD...
    wall_material VARCHAR(50) NOT NULL,
    water_supply VARCHAR(50) NOT NULL,
    electricity_access VARCHAR(50) NOT NULL,
    sanitation_method VARCHAR(50) NOT NULL,
    waste_collection VARCHAR(50) NOT NULL,
    accessibility_level VARCHAR(50) NOT NULL,
    
    number_of_rooms INT NOT NULL CHECK (number_of_rooms >= 0),
    number_of_bathrooms INT NOT NULL CHECK (number_of_bathrooms >= 0),
    
    is_risk_area BOOLEAN NOT NULL DEFAULT FALSE,
    is_conflict_area BOOLEAN NOT NULL DEFAULT FALSE,

    -- REGRA DE DOMÍNIO (HC-003): Banheiros não podem exceder quartos
    CONSTRAINT check_bathrooms_le_rooms CHECK (number_of_bathrooms <= number_of_rooms)
);


-- 2.3. Situação Socioeconômica
-- Value Object: SocioEconomicSituation.valueObject.ts
CREATE TABLE social_economic_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id) ON DELETE CASCADE,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Regras de não-negativos
    total_family_income NUMERIC(10, 2) NOT NULL CHECK (total_family_income >= 0),
    income_per_capita NUMERIC(10, 2) NOT NULL CHECK (income_per_capita >= 0),
    
    receives_social_benefit BOOLEAN NOT NULL,
    has_unemployed BOOLEAN NOT NULL,
    main_source_of_income TEXT NOT NULL,

    -- JSONB para SocialBenefitsCollection
    -- Exemplo de estrutura: [{"name": "BPC", "amount": 1412.00, "legalBasis": "..."}]
    benefits_data JSONB NOT NULL DEFAULT '[]'::jsonb
);


-- 2.4. Saúde Social e Rede de Apoio (Combinado)
-- Value Objects: CommunitySupportNetwork.ts e SocialHealthSummary.ts
CREATE TABLE social_network_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id) ON DELETE CASCADE,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- CommunitySupportNetwork
    relatives_support BOOLEAN NOT NULL,
    neighbors_support BOOLEAN NOT NULL,
    family_conflicts TEXT,
    groups_participation BOOLEAN NOT NULL,
    leisure_access BOOLEAN NOT NULL,
    discrimination_faced BOOLEAN NOT NULL,

    -- SocialHealthSummary
    constant_care_required BOOLEAN NOT NULL,
    mobility_impairment BOOLEAN NOT NULL,
    drug_therapy_relevant BOOLEAN NOT NULL,
    
    -- Lista de Strings para dependências (ex: BATHING, EATING)
    functional_dependencies TEXT[] DEFAULT '{}'
);


-- ===========================================================================================
-- CAMADA 3: INTERVENÇÕES E RELATÓRIOS (Transacional)
-- ===========================================================================================

-- 3.1. Atendimentos
-- Entidade: SocialCareAppointment.entity.ts
CREATE TABLE social_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id),
    
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    professional_id UUID NOT NULL, -- ID do autor do registro
    
    type VARCHAR(50) NOT NULL,
    
    -- REGRAS DE DOMÍNIO (SCA-003, SCA-004): Limites de caracteres para concisão
    summary TEXT NOT NULL CHECK (length(summary) <= 500),
    action_plan TEXT CHECK (length(action_plan) <= 2000),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3.2. Encaminhamentos
-- Entidade: Referral.entity.ts
CREATE TABLE social_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id),
    
    referred_person_id UUID NOT NULL, -- Validar no App se pertence à família
    requesting_professional_id UUID NOT NULL,
    
    destination_service VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Máquina de Estados
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3.3. Violação de Direitos
-- Entidade: RightsViolationReport.entity.ts
CREATE TABLE social_rights_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    patient_id UUID NOT NULL REFERENCES social_patients(id),
    
    victim_id UUID NOT NULL,
    violation_type VARCHAR(50) NOT NULL, -- (ex: NEGLECT, PHYSICAL_VIOLENCE)
    
    report_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE,
    
    description TEXT NOT NULL,
    actions_taken TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- REGRA DE DOMÍNIO: Incidente não pode ser no futuro em relação ao reporte
    CONSTRAINT check_incident_before_report CHECK (incident_date <= report_date)
);