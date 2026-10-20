-- SIJPH-TERINTEGRASI initial additive schema.
-- Apply to a development branch first. No production data is deleted or rewritten.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  email text,
  phone text,
  timezone text NOT NULL DEFAULT 'Asia/Jakarta',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text UNIQUE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','invited','suspended','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id, organization_id)
);

CREATE TABLE IF NOT EXISTS service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  requires_review boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE RESTRICT,
  client_type text NOT NULL DEFAULT 'individual' CHECK (client_type IN ('individual','company','institution')),
  display_name text NOT NULL,
  email text,
  phone text,
  identity_ref text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no text NOT NULL UNIQUE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  service_id uuid REFERENCES service_catalog(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  channel text NOT NULL DEFAULT 'web' CHECK (channel IN ('web','portal','walk_in','phone','staff')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft','submitted','reviewing','needs_information','accepted','assigned','in_progress','waiting_client','completed','rejected','cancelled','archived')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to uuid REFERENCES app_users(id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  closed_at timestamptz,
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  from_status text,
  to_status text,
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queue_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  service_id uuid REFERENCES service_catalog(id) ON DELETE SET NULL,
  location_label text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queue_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')::date,
  ticket_no text NOT NULL,
  service_id uuid REFERENCES service_catalog(id) ON DELETE SET NULL,
  counter_id uuid REFERENCES queue_counters(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  visitor_label text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','called','serving','skipped','completed','cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','priority')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  called_at timestamptz,
  service_started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  UNIQUE (ticket_date, ticket_no)
);

CREATE TABLE IF NOT EXISTS signage_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  location_label text,
  screen_token_hash text,
  active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signage_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid REFERENCES signage_screens(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('announcement','image','video','education','advertisement')),
  asset_url text,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 15 CHECK (duration_seconds BETWEEN 5 AND 600),
  sort_order integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','approved','published','paused','expired','rejected')),
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  request_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email','sms','whatsapp','push')),
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','read','cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients (lower(display_name));
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created ON service_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_assignee_due ON service_requests (assigned_to, due_at);
CREATE INDEX IF NOT EXISTS idx_request_events_request_created ON service_request_events (request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_date_status ON queue_tickets (ticket_date, status, issued_at);
CREATE INDEX IF NOT EXISTS idx_signage_items_schedule ON signage_items (screen_id, status, starts_at, ends_at, sort_order);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events (entity_type, entity_id, created_at DESC);

INSERT INTO roles (code, name, description) VALUES
  ('super_admin', 'Super Administrator', 'Pengelolaan konfigurasi dan akses sistem'),
  ('admin', 'Administrator', 'Administrasi operasional'),
  ('legal_staff', 'Staf Layanan Hukum', 'Pengelolaan permohonan dan penugasan'),
  ('reviewer', 'Pemeriksa/Penyetuju', 'Pemeriksaan dan persetujuan sesuai kewenangan'),
  ('finance', 'Keuangan', 'Keuangan dan akuntansi'),
  ('hr', 'HRD dan Payroll', 'Data kepegawaian dengan akses terbatas'),
  ('queue_operator', 'Petugas Antrian', 'Operasional antrian dan loket'),
  ('signage_manager', 'Pengelola Digital Signage', 'Pengelolaan konten layar'),
  ('client', 'Klien', 'Akses portal klien milik sendiri')
ON CONFLICT (code) DO NOTHING;

INSERT INTO service_catalog (code, name, category, description) VALUES
  ('KONSULTASI-AWAL', 'Konsultasi Awal', 'consultation', 'Permohonan konsultasi awal'),
  ('PENYUSUNAN-DOKUMEN', 'Penyusunan Dokumen Hukum', 'document', 'Permohonan penyusunan atau peninjauan dokumen'),
  ('PENELITIAN-HUKUM', 'Penelitian Hukum', 'research', 'Permohonan penelitian hukum berbasis sumber'),
  ('LAYANAN-UMUM', 'Layanan Hukum Lainnya', 'general', 'Permohonan layanan yang memerlukan klasifikasi')
ON CONFLICT (code) DO NOTHING;
