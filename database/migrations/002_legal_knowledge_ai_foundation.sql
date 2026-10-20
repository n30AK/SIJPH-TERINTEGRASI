-- SIJPH-TERINTEGRASI: additive legal knowledge and AI audit foundation.
-- This migration is version-controlled only. Apply to a non-production branch and test before production.
BEGIN;

CREATE TABLE IF NOT EXISTS legal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  source_key text NOT NULL,
  title text NOT NULL,
  publisher text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('regulation_portal','court_decision','official_jdih','internal_policy','secondary_source','other')),
  canonical_url text NOT NULL,
  jurisdiction text,
  subject_tags text[] NOT NULL DEFAULT '{}',
  usage_rights text,
  trust_tier text NOT NULL DEFAULT 'unverified' CHECK (trust_tier IN ('primary_official','secondary','internal','unverified')),
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, source_key)
);

CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  source_id uuid NOT NULL REFERENCES legal_sources(id) ON DELETE RESTRICT,
  document_type text NOT NULL CHECK (document_type IN ('regulation','court_decision','guidance','internal_policy','template','other')),
  title text NOT NULL,
  document_number text,
  document_year integer CHECK (document_year IS NULL OR document_year BETWEEN 1800 AND 2300),
  issuer text,
  jurisdiction text,
  date_issued date,
  date_promulgated date,
  effective_from date,
  effective_until date,
  legal_status text NOT NULL DEFAULT 'unverified' CHECK (legal_status IN ('in_force','amended','revoked','expired','draft','unverified','not_applicable')),
  status_verified_at timestamptz,
  canonical_url text NOT NULL,
  external_identifier text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES legal_documents(id) ON DELETE RESTRICT,
  version_label text NOT NULL,
  source_url text NOT NULL,
  content_sha256 text,
  extracted_text text,
  extraction_method text NOT NULL DEFAULT 'manual' CHECK (extraction_method IN ('manual','html','pdf_text','ocr','api','other')),
  extraction_quality numeric(4,3) CHECK (extraction_quality IS NULL OR extraction_quality BETWEEN 0 AND 1),
  fetched_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','needs_review')),
  change_summary text,
  UNIQUE (document_id, version_label)
);

CREATE TABLE IF NOT EXISTS legal_provisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_version_id uuid NOT NULL REFERENCES legal_document_versions(id) ON DELETE RESTRICT,
  provision_key text NOT NULL,
  chapter_label text,
  article_label text,
  paragraph_label text,
  heading text,
  provision_text text NOT NULL,
  text_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_version_id, provision_key)
);

CREATE TABLE IF NOT EXISTS legal_document_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_document_id uuid NOT NULL REFERENCES legal_documents(id) ON DELETE RESTRICT,
  to_document_id uuid NOT NULL REFERENCES legal_documents(id) ON DELETE RESTRICT,
  relationship_type text NOT NULL CHECK (relationship_type IN ('amends','revokes','implements','interprets','related_to','supersedes')),
  effective_date date,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  source_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_document_id <> to_document_id),
  UNIQUE (from_document_id, to_document_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS legal_ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES legal_sources(id) ON DELETE RESTRICT,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','partial','failed','cancelled')),
  items_seen integer NOT NULL DEFAULT 0 CHECK (items_seen >= 0),
  items_created integer NOT NULL DEFAULT 0 CHECK (items_created >= 0),
  items_updated integer NOT NULL DEFAULT 0 CHECK (items_updated >= 0),
  error_code text,
  error_summary text,
  run_metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS legal_retrieval_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id uuid,
  legal_document_version_id uuid NOT NULL REFERENCES legal_document_versions(id) ON DELETE RESTRICT,
  legal_provision_id uuid REFERENCES legal_provisions(id) ON DELETE RESTRICT,
  citation_text text NOT NULL,
  source_url text NOT NULL,
  source_snapshot_sha256 text,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_analysis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id uuid,
  requested_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  analysis_type text NOT NULL CHECK (analysis_type IN ('intake_summary','fact_map','legal_research','scenario_simulation','red_team','companion_reply','other')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','needs_human_review','approved','rejected','failed')),
  model_provider text,
  model_name text,
  prompt_version text,
  input_fingerprint text,
  output_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  uncertainty_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  reviewed_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_decision text CHECK (review_decision IS NULL OR review_decision IN ('approved','rejected','revision_requested'))
);

CREATE TABLE IF NOT EXISTS legal_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id uuid NOT NULL REFERENCES ai_analysis_runs(id) ON DELETE RESTRICT,
  scenario_key text NOT NULL,
  title text NOT NULL,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  proposed_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  counterarguments jsonb NOT NULL DEFAULT '[]'::jsonb,
  unknowns jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','revision_requested')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_run_id, scenario_key)
);

CREATE INDEX IF NOT EXISTS idx_legal_sources_active_tier ON legal_sources(active, trust_tier);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON legal_documents(legal_status, status_verified_at);
CREATE INDEX IF NOT EXISTS idx_legal_documents_number_year ON legal_documents(document_number, document_year);
CREATE INDEX IF NOT EXISTS idx_legal_versions_verification ON legal_document_versions(verification_status, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_provisions_article ON legal_provisions(article_label);
CREATE INDEX IF NOT EXISTS idx_legal_relationships_target ON legal_document_relationships(to_document_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_legal_ingestion_status ON legal_ingestion_runs(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_status ON ai_analysis_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_case ON ai_analysis_runs(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_scenarios_run ON legal_scenarios(analysis_run_id);

COMMIT;
