# Portable Node.js runtime for self-hosting; no provider-specific adapter required.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Build-only placeholders. Runtime secrets must be injected by the hosting environment.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV SIJPH_ADMIN_API_KEY=build-only-placeholder-not-a-secret
ENV DATA_CONTROLLER_NAME=
ENV PRIVACY_CONTACT_EMAIL=
ENV PRIVACY_NOTICE_VERSION=build-placeholder
ENV PUBLIC_INTAKE_ENABLED=false
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
