-- Ensure source keys are unique even for global (organization_id NULL) sources.
BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS legal_sources_global_key_unique
ON legal_sources ((COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid)), source_key);
COMMIT;
