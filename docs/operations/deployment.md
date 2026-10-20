# Deployment and Environment Checklist

## Current state
The repository is scaffolded as a Next.js Node application. Neon production schema and a separate development branch exist. No hosting provider has been connected, no hosting secrets have been set, and no public production URL has been verified yet.

## Required environment
- `DATABASE_URL`: pooled Neon connection string for the intended branch, stored as a server-side secret in the hosting provider. Never add it to GitHub files or `NEXT_PUBLIC_*` variables.
- `NEXT_PUBLIC_APP_URL`: public website origin after domain setup.
- AI provider keys are optional and must remain unset until the AI server adapter, provider, and spending limits are configured.

## Build checks
1. Install dependencies with Node.js 22 and npm.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Start the app and verify `GET /api/health`.
5. Test invalid and valid service-intake payloads in a non-production environment.
6. Verify a valid request creates the client, request, and event atomically.
7. Confirm secrets do not appear in browser bundles or logs.

## Deployment provider requirements
Select a provider that supports Next.js server routes with a Node runtime, environment secrets, build logs, HTTPS, a custom domain, and deployment previews. Keep Neon separate. Before production launch, set the production `DATABASE_URL` secret to the production branch and run a smoke test with a controlled test record.

## Safety gates before public launch
- Finalize the organization's privacy notice and data controller/contact details.
- Add request rate limiting, anti-abuse protection and duplicate submission handling.
- Configure authentication and server-side role authorization before enabling internal workspaces.
- Store legal documents in private object storage, not public static folders.
- Configure backups, restore tests, retention, monitoring and incident response.
- Review the legal-service workflow and obtain professional approval for official documents and advice.

## Operational note
A successful Git commit or build is not proof of deployment. Report the public URL only after the hosting provider returns a deployment URL and the live health endpoint and main workflow have been tested.
