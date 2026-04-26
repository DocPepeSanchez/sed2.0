# SED 2.0 — imagen de aplicación (Next.js 14 + Drizzle).
# Multi-stage: deps → builder → runner (imagen final ~150 MB).

# ───────── 1. Dependencias ─────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# argon2 requiere build tools en la fase de instalación.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
# `--legacy-peer-deps` evita el conflicto eslint↔eslint-config-next que se
# manifiesta cuando hay versiones mayores incompatibles (ya pinneamos a v8,
# pero esto deja la imagen robusta ante futuras actualizaciones).
RUN npm install --legacy-peer-deps --no-audit --no-fund

# ───────── 2. Builder ─────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ───────── 3. Runner ─────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN groupadd --system --gid 1001 sed \
  && useradd --system --uid 1001 --gid sed sed

# Copiamos artefactos de build, node_modules de producción, scripts de migración.
COPY --from=builder --chown=sed:sed /app/.next ./.next
COPY --from=builder --chown=sed:sed /app/public ./public
COPY --from=builder --chown=sed:sed /app/node_modules ./node_modules
COPY --from=builder --chown=sed:sed /app/package.json ./package.json
COPY --from=builder --chown=sed:sed /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=sed:sed /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=sed:sed /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=sed:sed /app/src ./src
COPY --from=builder --chown=sed:sed /app/drizzle ./drizzle
COPY --from=builder --chown=sed:sed /app/scripts ./scripts

USER sed
EXPOSE 3000

CMD ["npm", "run", "start"]
