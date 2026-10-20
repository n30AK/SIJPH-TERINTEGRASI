# Portable Deployment — SIJPH-TERINTEGRASI

This repository can build a standard Docker image for a Node.js 22 runtime. GitHub stores the source and CI workflow; Neon remains the PostgreSQL service. A container image does **not** run publicly by itself: an operator must provide a server or container runtime with HTTPS, a domain, secret storage, monitoring, and backup controls.

## Required runtime environment

Configure these only in the host's secret/environment settings; never commit real values:

- `DATABASE_URL`: Neon production connection string using TLS and a least-privilege database role.
- `SIJPH_ADMIN_API_KEY`: a randomly generated secret with at least 32 characters; rotate it if exposed.
- `DATA_CONTROLLER_NAME`: the actual legal name of the data controller.
- `PRIVACY_CONTACT_EMAIL`: an actively monitored official privacy contact.
- `PRIVACY_NOTICE_VERSION`: approved version identifier for the privacy notice.
- `PUBLIC_INTAKE_ENABLED=false`: keep disabled until the legal, privacy, anti-abuse, and operational gates are approved.
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS URL after domain and TLS are configured.

The Docker build uses dummy values solely to compile. They are not production credentials and must never be copied into runtime configuration.

## Build and smoke test

From the repository root on a Docker-capable machine:

```sh
docker build -t sijph-terintegrasi:release .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SIJPH_ADMIN_API_KEY="$SIJPH_ADMIN_API_KEY" \
  -e DATA_CONTROLLER_NAME="$DATA_CONTROLLER_NAME" \
  -e PRIVACY_CONTACT_EMAIL="$PRIVACY_CONTACT_EMAIL" \
  -e PRIVACY_NOTICE_VERSION="$PRIVACY_NOTICE_VERSION" \
  -e PUBLIC_INTAKE_ENABLED=false \
  sijph-terintegrasi:release
```

Verify `GET /api/health` returns HTTP 200 and `GET /api/ready` returns HTTP 503 while public intake is intentionally disabled. The readiness endpoint should return HTTP 200 only after every configured launch gate passes. Do not enable intake just to make readiness green.

## Before commercial traffic

- Run CI successfully: lint, TypeScript, and production build.
- Verify `/api/health`, `/api/ready`, and every admin endpoint on the deployed runtime.
- Replace shared-key-only admin access with individual authenticated identities and server-enforced roles before exposing administration to multiple staff.
- Add rate limiting, abuse controls, alerting, tested backups and restore, incident response, and access reviews.
- Have qualified counsel approve the privacy notice, retention schedule, client consent, terms of service, legal-content provenance, and AI disclaimer.
- Do not advertise automated legal conclusions or AI simulation as production-ready until model integration, source citations, evaluation, auditability, and human review have passed acceptance tests.
- Keep intake disabled until the data controller name and privacy contact are confirmed by the organization.

## Current boundary

This file makes deployment portable; it does not mean a production deployment has been created. A publicly reachable runtime and authorized DNS/TLS configuration are still required. GitHub Pages alone cannot run the current Next.js server routes or securely connect to Neon.
