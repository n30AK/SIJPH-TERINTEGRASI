# Commercial Go-Live Gate — SIJPH-TERINTEGRASI

This checklist is intentionally fail-closed. A public landing page is not the same as a commercial legal-services platform. Do not advertise operational legal AI, automated legal conclusions, or guaranteed outcomes before the respective functions are tested and approved.

## Runtime readiness
- [ ] Deploy the `main` commit to the selected hosting account and record deployment ID, URL, build logs, and commit SHA.
- [ ] Configure `DATABASE_URL` with a least-privilege runtime role and TLS; never commit credentials.
- [ ] Configure `SIJPH_ADMIN_API_KEY` as a server-only secret (32+ random characters); rotate it if exposed.
- [ ] Apply and verify versioned migrations to the intended environment, with backup/restore and rollback plan.
- [ ] Confirm `GET /api/health` returns 200 and `GET /api/ready` returns 200 after all launch requirements are met.
- [ ] Verify a database outage returns a controlled degraded response and does not expose secrets or SQL details.

## Privacy and intake gate
- [ ] Obtain the legal entity/controller name, privacy contact, official address/contact channel, and approved privacy notice.
- [ ] Configure `DATA_CONTROLLER_NAME`, `PRIVACY_CONTACT_EMAIL`, and `PRIVACY_NOTICE_VERSION`.
- [ ] Confirm lawful purpose, notice, consent language, retention/deletion schedule, subject-rights process, breach handling, and vendor/data-transfer review.
- [ ] Keep `PUBLIC_INTAKE_ENABLED=false` until legal and operational approval, abuse protection, and access procedures are in place.
- [ ] Test duplicate submissions, malicious payloads, spam/rate limiting, transactional rollback, and incident monitoring.
- [ ] Confirm only necessary personal data is collected and access is organization-scoped.

## Legal and AI safety
- [ ] Confirm source permissions and ingestion terms before bulk retrieval; registry seed entries are not legal-content ingestion.
- [ ] Verify official document versions and effective dates manually; do not mark a source verified from model memory.
- [ ] Complete individual authenticated sessions and server-side RBAC; shared admin API key is a temporary internal control, not a production identity system.
- [ ] Test cross-organization access denial, audit completeness, secret rotation, reviewer identity attribution, and approval/revision/rejection flows.
- [ ] Keep AI Companion clearly labeled as basic/static until a provider adapter, prompt-injection controls, source citations, uncertainty handling, and evaluations are deployed.
- [ ] Do not enable client-facing legal simulation until a human reviewer approves material outputs and citations.

## Commercial operations
- [ ] Approve service terms, fee/pricing disclosures (if any), complaints/escalation channel, service boundaries, and conflict-check workflow.
- [ ] Define support hours, incident owner, monitoring, backup cadence, recovery objectives, and data deletion process.
- [ ] Run accessibility, mobile, browser, load, security, and user-acceptance tests.
- [ ] Confirm the deployment is publicly reachable over HTTPS, custom domain (if applicable) is verified, and rollback has been tested.

## Automated gate
`GET /api/ready` checks database schema, active service catalog, admin secret, controller identity, privacy contact/version, and whether public intake is enabled. It never returns credential values. A `503 blocked` response means the commercial launch gate is not met.