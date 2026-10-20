# SIJPH-TERINTEGRASI

**Sistem Informasi Pelayanan Jasa Hukum Terintegrasi**

Platform pelayanan hukum profesional dengan website publik, portal klien, workspace operasional, sistem antrian, digital signage, ERP, dan AI multi-agent.

## Repository & infrastructure

- GitHub: https://github.com/n30AK/SIJPH-TERINTEGRASI
- Database: Neon PostgreSQL
- Neon project: `empty-sky-04023805`
- Production branch: `br-polished-paper-b5jkz6lz`
- Hosting: terpisah dari database; provider dipilih sesuai dukungan CI/CD, secrets, dan anggaran.
- Bahasa utama UI: Bahasa Indonesia.

> Status per 20 Oktober 2026: repository berisi fondasi Next.js, situs publik, endpoint health/intake, endpoint baca antrean/signage, halaman signage, migrasi database awal, dan proposal pembangunan. Skema Neon production telah diverifikasi memiliki 15 tabel aplikasi. Build lokal belum dapat diverifikasi pada sesi ini karena runner tidak memiliki akses DNS ke GitHub/npm; status CI harus diperiksa pada GitHub Actions. Hosting belum tersambung dan belum ada URL live terverifikasi. Intake publik tetap dinonaktifkan secara default hingga privasi dan kontrol anti-abuse disetujui.

## Version 2.0 baseline documents

- [Master Project Summary v2.0](docs/product/PROJECT-SUMMARY-V2.md)
- [Technical Blueprint v2.0](docs/architecture/BLUEPRINT-TEKNIS-V2.md)
- [Official Proposal v2.0](docs/product/PROPOSAL-RESMI-V2.md)
- [AI Multi-Agent Contracts](docs/architecture/AI-MULTI-AGENT-CONTRACTS.md)
- [Implementation Audit — 20 October 2026](docs/operations/IMPLEMENTATION-AUDIT-2026-10-20.md)
- [Legal knowledge and AI foundation migration](database/migrations/002_legal_knowledge_ai_foundation.sql) — applied and re-run idempotently on Neon `development-work`; not applied to production.
- [Official legal source seed](database/migrations/003_seed_official_legal_sources.sql) — four official source endpoints seeded and re-run idempotently on `development-work`.
- [Global legal source uniqueness](database/migrations/004_legal_source_global_uniqueness.sql) — applied on `development-work`.
- [Legal Knowledge API guide](docs/operations/LEGAL-KNOWLEDGE-API.md) — admin-only registry/search endpoints and limitations.

## Product surfaces

1. **Website publik** — profil, layanan, edukasi hukum, berita, formulir konsultasi dan permohonan.
2. **Portal klien** — akun, permohonan, status, jadwal, dokumen dan notifikasi.
3. **Workspace staf** — CRM, penugasan/perkara, agenda, dokumen, persetujuan dan audit.
4. **Queue management** — penerbitan nomor, loket, panggil ulang, pindah, layani, selesai dan metrik waktu tunggu.
5. **Digital signage** — antrian real-time, pengumuman, edukasi hukum, playlist dan kampanye iklan terjadwal.
6. **ERP** — keuangan/akuntansi, HRD/payroll, pengadaan, inventaris/aset, perpajakan dan laporan.
7. **AI multi-agent** — riset hukum berbasis sumber, AI Companion publik/klien/staf, bantuan dokumen, antrian, signage dan insight operasional.

## Engineering principles

- Build operational workflows, not static dashboard mockups.
- Enforce authentication and authorization on the server; never trust client-side role checks.
- Keep secrets in hosting environment variables, never in the repository or browser bundle.
- Keep sensitive client/legal documents private and use time-limited authorized access.
- Use versioned database migrations and additive changes; avoid destructive production SQL.
- Financial postings are corrected through auditable reversal/correction workflows, not silent deletion.
- AI suggestions must be reviewed where they affect legal advice, official documents, approvals, payroll, tax or financial postings.
- AI legal answers should cite verifiable sources and disclose uncertainty.
- Use synthetic data only in development and clearly label it.
- Never claim deployment or integration success without a verified test.

## Initial delivery plan

### Phase 1 — Foundation
- Architecture, environment configuration, database migrations, access model, audit events and CI.
- Professional responsive public website and app shell.
- Health endpoint and deployment instructions.

### Phase 2 — Service MVP
- Client/lead intake, conflict-check workflow, service requests, assignment, agenda, document metadata and status tracking.
- Working CRUD forms, validation, permissions, audit history and initial reports.

### Phase 3 — Queue & signage
- Ticket lifecycle, counters/operators, public queue display, announcements and content playlist scheduling.

### Phase 4 — ERP
- Accounting, billing, HR/payroll, procurement, inventory/assets, tax support and management reporting.

### Phase 5 — AI
- Provider-agnostic AI adapter, role-scoped companions, agent orchestration, source-grounded legal research, cost limits and auditability.

### Phase 6 — Production readiness
- Authorization/security tests, workflow tests, database backup/restore, responsive/browser checks, health checks and smoke tests.

## Suggested stack

- TypeScript for frontend and backend.
- React with a routing/SSR framework selected to meet SEO and deployment requirements.
- PostgreSQL on Neon; schema migrations checked into Git.
- Server-side API with input validation, transaction boundaries, authorization and audit logging.
- Private object storage for sensitive uploads.
- PWA-first client experience; native packaging only after validating demand.
- CI checks: lint, typecheck, tests, build, migration review and smoke tests.

The final provider and framework must be confirmed by the implementation audit before locking configuration.

## Repository structure (target)

```text
apps/
  web/              # public site and authenticated portal
  signage/           # full-screen waiting-room display
  api/               # server-side API
packages/
  ui/                # shared accessible UI components
  domain/             # business rules and validation
  db/                 # schema and migration tooling
  ai/                 # provider adapters, agents, safety boundaries
  config/             # shared TypeScript/lint/test configuration
docs/
  architecture/
  operations/
  security/
  product/
database/
  migrations/
.github/
  workflows/
```

## First operational acceptance criteria

- A submitted service request is validated, persisted, retrievable and auditable.
- Server-side permissions prevent unauthorized access to another client's record.
- Queue ticket state changes are persisted and reflected on the signage display.
- Signage never exposes client names, legal case details or other private data.
- Each report can be traced to the underlying records and has a defined date range.
- AI responses respect the active user's access scope and identify source limitations.
- Health check, tests, build and deployment smoke tests pass before a release is called ready.

## Development

Follow the future `docs/architecture` and `docs/operations` instructions as they are added. Never commit `.env`, database URLs, API keys, signing secrets, real client documents, or production data.
