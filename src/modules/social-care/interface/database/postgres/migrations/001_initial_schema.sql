-- Migration: Initial Schema for Social Care
-- Database: PostgreSQL 17

-- 1. Tabela Principal (Agregado Raiz)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL UNIQUE, -- Identidade externa (Identity Context)
    
    -- Avaliações Sociais (Value Objects em JSONB para flexibilidade)
    housing_condition JSONB,
    socioeconomic_situation JSONB,
    community_support_network JSONB,
    social_health_summary JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance nas avaliações (GIST/GIN para JSONB se necessário)
CREATE INDEX IF NOT EXISTS idx_patients_person_id ON patients(person_id);

-- 2. Tabela de Diagnósticos (Evolutivos)
CREATE TABLE IF NOT EXISTS patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    icd_code VARCHAR(10) NOT NULL,
    diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON patient_diagnoses(patient_id);

-- 3. Tabela de Membros da Família
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    person_id UUID NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary_caregiver BOOLEAN DEFAULT FALSE,
    resides_with_patient BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, person_id) -- Regra R3: Unicidade de membros na família
);

-- 4. Tabela de Atendimentos (Append-Only para suportar grandes volumes)
CREATE TABLE IF NOT EXISTS social_care_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    professional_in_charge_id UUID NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    summary TEXT NOT NULL,
    action_plan TEXT,
    appointment_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON social_care_appointments(patient_id);

-- 5. Tabela de Encaminhamentos
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    referred_person_id UUID NOT NULL, -- Pode ser o paciente ou familiar
    destination_service VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    requesting_professional_id UUID,
    referral_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Relatos de Violação de Direitos
CREATE TABLE IF NOT EXISTS rights_violation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    victim_id UUID NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    description_of_fact TEXT NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    report_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
