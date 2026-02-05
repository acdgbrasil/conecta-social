-- Migration: Add actions_taken to rights_violation_reports
-- Database: PostgreSQL 17

ALTER TABLE rights_violation_reports ADD COLUMN IF NOT EXISTS actions_taken TEXT;
