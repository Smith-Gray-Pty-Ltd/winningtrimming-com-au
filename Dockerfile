# syntax=docker/dockerfile:1.7
#
# Winning Trimming — Payload CMS / Next.js dev image.
# Optimised for local development with bind-mounted source + hot reload.
# For production, use a multi-stage build (see README "Production" section).
#
FROM node:20-slim AS base

# Install lightweight OS deps required by sharp / git / curl for debugging.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm via corepack and pin to pnpm 9 (the lockfile in this repo was
# generated with pnpm 9; pnpm 11 requires Node 22+). Adding `packageManager`
# to package.json makes corepack honour this version automatically.
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Environment — disable Next telemetry and favour IPv4 for DNS in containers.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation

# ---------------------------------------------------------------------------
# Dev stage: install ALL deps (incl. devDeps) so `next dev`, lint and type
# tooling all work. Source is bind-mounted at runtime via docker-compose.
# ---------------------------------------------------------------------------
FROM base AS dev

# Install dependencies first so they cache independently of source changes.
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the project (overridden by the bind mount in compose).
COPY . .

EXPOSE 3000

# `next dev` (via `pnpm dev`) boots the Payload-enabled Next.js app. Payload's
# Postgres adapter auto-syncs the schema on boot, so no separate migration step
# is required for local dev. Turbopack gives fast hot-module reload over the
# bind-mounted /app/src.
CMD ["pnpm", "dev"]

# ---------------------------------------------------------------------------
# Prod stage: install ALL deps, build the Next.js standalone output, then
# trim to a minimal runtime image with only production deps + the built .next.
# ---------------------------------------------------------------------------
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

FROM base AS prod-build

COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---------------------------------------------------------------------------
# Final prod runtime — standalone Next.js + production node_modules.
# ---------------------------------------------------------------------------
FROM base AS prod

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-build /app/.next ./.next
COPY --from=prod-build /app/public ./public
COPY --from=prod-build /app/package.json ./package.json
COPY --from=prod-build /app/next.config.js ./next.config.js
COPY --from=prod-build /app/redirects.js ./redirects.js
COPY --from=prod-build /app/tsconfig.json ./tsconfig.json
COPY --from=prod-build /app/src ./src

# Persist locally-stored uploads (media) and the Next.js cache.
# Media is served from public/media (see src/collections/Media.ts staticDir).
RUN mkdir -p /app/public/media
VOLUME ["/app/public/media", "/app/.next/cache"]

EXPOSE 3000

CMD ["pnpm", "start"]
