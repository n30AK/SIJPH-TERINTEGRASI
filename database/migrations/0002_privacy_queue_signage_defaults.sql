-- Additive defaults for a first controlled test; safe to run more than once.
CREATE TABLE IF NOT EXISTS privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  purpose text NOT NULL,
  notice_version text NOT NULL,
  source text NOT NULL DEFAULT 'public_web',
  consented_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_privacy_consents_client_date
  ON privacy_consents (client_id, consented_at DESC);

INSERT INTO signage_screens (code, name, location_label, active)
VALUES ('RUANG-TUNGGU-01', 'Layar Ruang Tunggu Utama', 'Ruang Tunggu', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO queue_counters (code, name, location_label, active)
VALUES
  ('LOKET-1', 'Loket 1', 'Ruang Pelayanan', true),
  ('LOKET-2', 'Loket 2', 'Ruang Pelayanan', true)
ON CONFLICT (code) DO NOTHING;
