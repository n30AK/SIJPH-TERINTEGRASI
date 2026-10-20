# SIJPH-TERINTEGRASI — Architecture Blueprint

## Goals
Deliver an operational legal-services platform with a public website, client portal, staff workspace, queue management, digital signage, ERP and permission-scoped AI agents. The product must not be a static dashboard: every enabled action needs validation, persistence, authorization, error handling and auditability.

## Runtime boundaries
- Next.js application: public pages, authenticated experiences, server API routes and health endpoint.
- Neon PostgreSQL: authoritative structured records; migrations are versioned in `database/migrations`.
- Private file storage: legal documents must not be placed in public asset folders or served by guessable URLs.
- AI provider adapter: server-only calls; credentials are environment secrets; model selection and usage limits are configurable.
- Signage client: only public queue state, approved announcements and published playlist content.
- CI: install, typecheck and build; later add unit, integration, authorization and smoke tests.

## Data domains
1. Identity and roles: users, role assignments, account state.
2. Service intake: clients, service catalog, requests, state-change events.
3. Queue: service counters, tickets, call/serve/complete lifecycle.
4. Signage: screen registry, content, approval, scheduling and playback status.
5. Audit and notifications: sensitive changes, actions and delivery lifecycle.
6. Later modules: matter/case workspaces, engagements, contracts, documents, accounting, HR/payroll, inventory, tax and management reports.

## Authorization
Authentication is not yet wired to a production identity provider. Do not expose staff records or client records until server-side session validation and per-record authorization are implemented. UI hiding is not access control. Portal endpoints must scope records to the authenticated client. Signage endpoints use a screen credential/token and return only approved public content.

## Initial request intake contract
POST `/api/public/service-requests` accepts `fullName`, `email`, `phone`, `serviceCode`, `summary`, and `privacyConsent: true`. It validates the body, looks up an active service code, and persists the client, request and request event inside one transaction. It returns a reference number on success. Production readiness still requires rate limiting, anti-abuse controls, privacy notice/versioning, duplicate handling and end-to-end testing.

## AI agents
- Public service companion: public FAQs and intake guidance only.
- Client companion: authenticated client-scoped records only.
- Legal research: source-backed results, jurisdiction/date awareness, no fabricated citations.
- Document drafting: approved templates and human review before issuance.
- Queue operations: aggregates and recommendations; never alter queue priority without authorized staff action.
- Signage: content suggestions only; publication requires approval and schedule validation.
- Finance/HR/tax: restricted access, anomaly review, no autonomous posting or payroll/tax filing.
- Orchestrator: tool allowlists, role-aware context, token/cost ceilings, timeout and fallback.

## Release gates
1. Migration applied on a non-production Neon branch and verified.
2. Typecheck and build pass.
3. Health endpoint responds and reports configuration without leaking secrets.
4. Public intake passes validation and writes a consistent transaction.
5. Staff authentication, authorization, audit and private document storage pass security tests before internal modules are exposed.
6. Queue lifecycle is reflected on signage without personal/private data.
7. Backup/restore, monitoring, rate limiting, retention and incident procedures are documented before production launch.

## Hosting
Hosting provider is intentionally not locked yet. Choose a provider that supports Next.js server routes, Node runtime, protected environment variables, build logs, custom domains and deployment previews. The database remains Neon and must not be exposed directly to browser JavaScript.
