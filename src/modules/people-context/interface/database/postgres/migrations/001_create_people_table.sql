-- Migration: Criar tabela de pessoas (People Context)
-- Identidade Única (Golden Record)

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY,
    legal_name TEXT NOT NULL,
    social_name TEXT,
    birth_date DATE NOT NULL,
    tax_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    logto_user_id TEXT UNIQUE,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_logto_user_id ON people(logto_user_id);
CREATE INDEX IF NOT EXISTS idx_people_tax_id ON people(tax_id);
