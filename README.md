# Winning Trimming

[![Payload](https://img.shields.io/badge/Payload-3.0-black.svg)](https://payloadcms.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Postgres](https://img.shields.io/badge/Postgres-16-336791.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker_Compose-2496ED.svg)](https://docs.docker.com/compose/)

Marketing site for **Winning Trimming** — marine, recreational and trade trimming, upholstery and covers. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, NSW.

Built with **Payload CMS 3** + **Next.js 15** (App Router, Turbopack) + **shadcn/ui**, packaged for local development on **OrbStack** via Docker Compose.

> **Trading name of Smith & Gray Pty Ltd** · ABN 92 655 426 707 · Shop 2, 25 Sara Street, Toronto NSW 2280 · 1300 799 882

---

## Quick start (OrbStack / Docker)

```bash
# 1. Configure env
cp .env.example .env
# Edit .env — set PAYLOAD_SECRET (openssl rand -base64 32) if you like

# 2. Build + launch the stack (Postgres + Next.js)
docker compose up -d --build

# 3. Visit the app (port 3010 — 3000 was taken by another local site)
open http://localhost:3010          # website
open http://localhost:3010/admin    # Payload admin panel
```

On first run the database schema is auto-pushed by Payload on boot — no manual
migration step required for local dev.

### Admin access

The local admin account is created during setup:

| Field    | Value                             |
| -------- | --------------------------------- |
| Email    | `admin@winningtrimming.com.au`    |
| Password | `Winning!Trimming2026`            |

> Rotate this password and the `PAYLOAD_SECRET` before any production deploy.

### Seeding content

From the admin dashboard click **"seed database"** to populate the home page,
contact page, sample posts, header and footer with demo content. Seeding is
destructive — it clears the collections it touches.

---

## Architecture

```
docker compose up
├── db     postgres:16-alpine     (volume: db_data, host port 5434)
├── web    winningtrimming-web    (Next.js dev + Payload, host port 3010)
           ├── /app          bind-mounted from repo (hot reload)
           ├── /app/node_modules   container-managed
           └── storage       local uploads (volume: storage)
```

Compose project name is **`winningtrimming`** (top-level `name:` in
`docker-compose.yml`, overridable via `COMPOSE_PROJECT_NAME`). This reclaims the
OrbStack project formerly used by the WordPress prototype.

### Useful commands

```bash
docker compose up -d                # start stack
docker compose logs -f web          # tail Next.js / Payload logs
docker compose exec web sh          # shell into app container
docker compose exec web pnpm lint   # run ESLint
docker compose exec db psql -U payload winningtrimming   # DB shell
docker compose down                 # stop (keeps data volumes)
docker compose down -v              # stop + wipe DB + storage volumes
```

### Host-side dev (without Docker)

You can also run the app on the host and only containerise Postgres:

```bash
docker compose up -d db
# In .env set POSTGRES_URI=postgresql://payload:payload_local_pw@localhost:5434/winningtrimming
corepack enable && pnpm install && pnpm dev
```

---

## Redirects (Squarespace migration)

Legacy Squarespace URLs are redirected at the Next.js layer in
[`redirects.js`](./redirects.js), independent of the database:

| From (Squarespace) | To          | Status |
| ------------------ | ----------- | ------ |
| `/home`            | `/`         | 308    |
| `/contact-us`      | `/contact`  | 308    |
| `/cart`            | `/`         | 308    |

Additional redirects can be managed from the admin panel via the **Redirects**
collection (powered by `@payloadcms/plugin-redirects`). The full source URL map
is preserved in [`squarespace-url-map.txt`](./squarespace-url-map.txt).

---

## Theming

- **Brand palette**: marine navy (CSS custom properties in
  `src/app/(frontend)/globals.css`). `--primary` = deep marine navy, `--accent`
  = marine blue.
- **Components**: shadcn/ui + Tailwind (`tailwind.config.mjs`).
- **Contact / CTA**: all "Book a Call/Inspection" buttons link to the
  Workshop Software booking portal.

---

## Storage

Uploads default to **local disk** (`/app/storage` in the container, persisted on
the `storage` volume). To use S3-compatible storage (Cloudflare R2, AWS S3,
MinIO), set these in `.env` and restart:

```
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=...
```

When `S3_BUCKET` is unset, the S3 plugin is skipped automatically
(`src/plugins/index.ts`).

---

## Production

This repo targets local dev. For production:

1. Build a multi-stage production image (dev stage → prod stage in `Dockerfile`).
2. Run `pnpm build && pnpm start` (Next.js production server).
3. Use managed Postgres and object storage (S3/R2).
4. Set a strong `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, and rotate the admin
   password.
5. Run migrations: `pnpm migrate` (uncomment `prodMigrations` in
   `src/payload.config.ts`).

---

## Project layout

```
src/
├── app/(frontend)/      # public Next.js site (pages, posts, search)
├── app/(payload)/       # Payload admin panel + API routes
├── blocks/              # layout-builder blocks (Content, Media, CTA, …)
├── collections/         # Pages, Posts, Media, Categories, Users
├── Header/ Footer/      # global nav config + components
├── heros/               # hero variants (high/medium/low impact)
├── endpoints/seed/      # demo content seed
├── plugins/             # SEO, redirects, form-builder, search, S3
└── payload.config.ts    # central Payload config
```
